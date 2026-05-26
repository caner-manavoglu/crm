import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from '../complaints/entities/complaint.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Complaint) private complaintRepo: Repository<Complaint>,
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,
    @InjectRepository(StaffAvailability)
    private availRepo: Repository<StaffAvailability>,
  ) {}

  async getDashboardStats() {
    const [total, pending, assigned, inProgress, resolved, closed] =
      await Promise.all([
        this.complaintRepo.count(),
        this.complaintRepo.count({
          where: { status: ComplaintStatus.PENDING },
        }),
        this.complaintRepo.count({
          where: { status: ComplaintStatus.ASSIGNED },
        }),
        this.complaintRepo.count({
          where: { status: ComplaintStatus.IN_PROGRESS },
        }),
        this.complaintRepo.count({
          where: { status: ComplaintStatus.RESOLVED },
        }),
        this.complaintRepo.count({ where: { status: ComplaintStatus.CLOSED } }),
      ]);

    const totalStaff = await this.availRepo.count();
    const availableStaff = await this.availRepo.count({
      where: { isAvailable: true },
    });

    return {
      total,
      pending,
      assigned,
      inProgress,
      resolved,
      closed,
      totalStaff,
      availableStaff,
    };
  }

  async getComplaintsByStatus() {
    return this.complaintRepo
      .createQueryBuilder('c')
      .select('c.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('c.status')
      .getRawMany();
  }

  async getComplaintsByDepartment() {
    return this.complaintRepo
      .createQueryBuilder('c')
      .innerJoin('c.category', 'cat')
      .innerJoin('cat.department', 'dept')
      .select('dept.name', 'department')
      .addSelect('COUNT(*)', 'count')
      .groupBy('dept.name')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  async getResolutionTrend(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    return this.complaintRepo
      .createQueryBuilder('c')
      .select("DATE_TRUNC('day', c.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('c.created_at >= :from', { from })
      .groupBy("DATE_TRUNC('day', c.created_at)")
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getStaffPerformance() {
    return this.assignmentRepo
      .createQueryBuilder('a')
      .innerJoin('a.staff', 'u')
      .select('u.name', 'name')
      .addSelect('u.surname', 'surname')
      .addSelect('COUNT(a.id)', 'totalAssigned')
      .groupBy('u.id')
      .addGroupBy('u.name')
      .addGroupBy('u.surname')
      .orderBy('"totalAssigned"', 'DESC')
      .getRawMany();
  }
}
