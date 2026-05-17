import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { ComplaintHistory } from '../complaints/entities/complaint-history.entity';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';
import { Category } from '../categories/entities/category.entity';
import { AssignmentType } from '../../common/enums/assignment-type.enum';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';
import { CreateComplaintDto } from '../complaints/dto/create-complaint.dto';
import { TransferAssignmentDto } from './dto/transfer-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment) private assignmentRepo: Repository<Assignment>,
    @InjectRepository(Complaint) private complaintRepo: Repository<Complaint>,
    @InjectRepository(ComplaintHistory) private historyRepo: Repository<ComplaintHistory>,
    @InjectRepository(StaffAvailability) private availRepo: Repository<StaffAvailability>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private dataSource: DataSource,
  ) {}

  async handleNewComplaint(complaint: Complaint, dto: CreateComplaintDto): Promise<Assignment | null> {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) return null;

    if (!dto.autoAssign && dto.preferredStaffId) {
      return this.assignComplaint(
        complaint.id,
        dto.preferredStaffId,
        AssignmentType.MANUAL,
        complaint.customerId,
      );
    }

    if (dto.autoAssign) {
      const staff = await this.findMostAvailableStaff(category.departmentId, complaint.cityId);
      if (staff) {
        return this.assignComplaint(complaint.id, staff.staffId, AssignmentType.AUTO, complaint.customerId);
      }
    }

    return null;
  }

  async findMostAvailableStaff(departmentId: string, cityId: string): Promise<StaffAvailability | null> {
    return this.availRepo
      .createQueryBuilder('sa')
      .innerJoin('sa.staff', 'u')
      .where('u.department_id = :departmentId', { departmentId })
      .andWhere('u.city_id = :cityId', { cityId })
      .andWhere('u.isActive = true')
      .andWhere('sa.is_available = true')
      .andWhere('sa.current_load < sa.max_capacity')
      .orderBy('sa.current_load', 'ASC')
      .getOne();
  }

  async assignComplaint(
    complaintId: string,
    staffId: string,
    type: AssignmentType,
    assignedById?: string,
  ): Promise<Assignment> {
    return this.dataSource.transaction(async (manager) => {
      // Lock staff_availability row to prevent race conditions
      const avail = await manager
        .createQueryBuilder(StaffAvailability, 'sa')
        .setLock('pessimistic_write')
        .where('sa.staff_id = :staffId', { staffId })
        .getOne();

      if (!avail || !avail.isAvailable || avail.currentLoad >= avail.maxCapacity) {
        throw new BadRequestException('Personel şu anda müsait değil.');
      }

      avail.currentLoad += 1;
      await manager.save(avail);

      const assignment = manager.create(Assignment, {
        complaintId,
        staffId,
        assignedById,
        assignmentType: type,
      });
      const saved = await manager.save(assignment);

      await manager.update(Complaint, complaintId, { status: ComplaintStatus.ASSIGNED });

      const complaint = await manager.findOne(Complaint, { where: { id: complaintId } });
      await manager.save(
        manager.create(ComplaintHistory, {
          complaintId,
          userId: assignedById,
          oldStatus: ComplaintStatus.PENDING,
          newStatus: ComplaintStatus.ASSIGNED,
          notes: type === AssignmentType.AUTO ? 'Otomatik atandı.' : 'Manuel atandı.',
        }),
      );

      return saved;
    });
  }

  async transferAssignment(
    assignmentId: string,
    dto: TransferAssignmentDto,
    requesterId: string,
  ): Promise<Assignment> {
    return this.dataSource.transaction(async (manager) => {
      const assignment = await manager.findOne(Assignment, {
        where: { id: assignmentId, isActive: true },
      });
      if (!assignment) throw new NotFoundException('Atama bulunamadı.');

      const oldStaffId = assignment.staffId;

      const newAvail = await manager
        .createQueryBuilder(StaffAvailability, 'sa')
        .setLock('pessimistic_write')
        .where('sa.staff_id = :staffId', { staffId: dto.toStaffId })
        .getOne();

      if (!newAvail || !newAvail.isAvailable || newAvail.currentLoad >= newAvail.maxCapacity) {
        throw new BadRequestException('Hedef personel müsait değil.');
      }

      assignment.staffId = dto.toStaffId;
      assignment.assignmentType = AssignmentType.TRANSFER;
      assignment.assignedById = requesterId;
      assignment.notes = dto.reason ?? null;
      await manager.save(assignment);

      newAvail.currentLoad += 1;
      await manager.save(newAvail);

      await manager
        .createQueryBuilder()
        .update(StaffAvailability)
        .set({ currentLoad: () => 'GREATEST(current_load - 1, 0)' })
        .where('staff_id = :staffId', { staffId: oldStaffId })
        .execute();

      const complaint = await manager.findOne(Complaint, { where: { id: assignment.complaintId } });
      await manager.save(
        manager.create(ComplaintHistory, {
          complaintId: assignment.complaintId,
          userId: requesterId,
          oldStatus: complaint?.status,
          newStatus: complaint?.status,
          notes: `Transfer: ${dto.reason || 'Yeni personele aktarıldı.'}`,
        }),
      );

      return assignment;
    });
  }

  async getMyAssignments(staffId: string) {
    return this.assignmentRepo.find({
      where: { staffId, isActive: true },
      relations: ['complaint', 'complaint.category', 'complaint.city', 'complaint.customer'],
      order: { assignedAt: 'DESC' },
    });
  }

  async findByComplaintId(complaintId: string) {
    return this.assignmentRepo.findOne({
      where: { complaintId, isActive: true },
      relations: ['staff'],
    });
  }

  async processPool(): Promise<{ assigned: number; stillPending: number }> {
    const pendingComplaints = await this.complaintRepo.find({
      where: { status: ComplaintStatus.PENDING },
      relations: ['category'],
      order: { createdAt: 'ASC' },
    });

    let assigned = 0;

    for (const complaint of pendingComplaints) {
      if (!complaint.category?.departmentId || !complaint.cityId) continue;

      const staff = await this.findMostAvailableStaff(
        complaint.category.departmentId,
        complaint.cityId,
      );

      if (staff) {
        try {
          await this.assignComplaint(complaint.id, staff.staffId, AssignmentType.AUTO);
          assigned++;
        } catch {
          // Staff became unavailable between find and assign — skip
        }
      }
    }

    const stillPending = pendingComplaints.length - assigned;
    return { assigned, stillPending };
  }

  async adminAssign(complaintId: string, staffId: string, adminId: string) {
    return this.assignComplaint(complaintId, staffId, AssignmentType.MANUAL, adminId);
  }
}
