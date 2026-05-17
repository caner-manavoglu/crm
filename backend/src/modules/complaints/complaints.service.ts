import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Complaint } from './entities/complaint.entity';
import { ComplaintHistory } from './entities/complaint-history.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { ComplaintQueryDto } from './dto/complaint-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ComplaintsService {
  private static readonly GUEST_EMAIL = 'guest.portal@crm.local';

  constructor(
    @InjectRepository(Complaint) private complaintRepo: Repository<Complaint>,
    @InjectRepository(ComplaintHistory) private historyRepo: Repository<ComplaintHistory>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateComplaintDto, customerId?: string): Promise<Complaint> {
    const resolvedCustomerId = customerId ?? (await this.getOrCreateGuestCustomerId());

    const complaint = this.complaintRepo.create({
      title: dto.title,
      content: dto.content,
      categoryId: dto.categoryId,
      cityId: dto.cityId,
      priority: dto.priority,
      customerId: resolvedCustomerId,
    });
    const saved = await this.complaintRepo.save(complaint);

    await this.historyRepo.save(
      this.historyRepo.create({
        complaintId: saved.id,
        userId: customerId,
        newStatus: saved.status,
        notes: customerId ? 'Şikayet oluşturuldu.' : 'Portal üzerinden şikayet oluşturuldu.',
      }),
    );

    return saved;
  }

  async findAll(query: ComplaintQueryDto): Promise<PaginatedResult<Complaint>> {
    return this.buildPaginatedQuery(query);
  }

  async findByCustomer(customerId: string, query: ComplaintQueryDto): Promise<PaginatedResult<Complaint>> {
    return this.buildPaginatedQuery(query, { customerId });
  }

  async findOne(id: string): Promise<Complaint> {
    const complaint = await this.complaintRepo.findOne({
      where: { id },
      relations: ['category', 'city'],
    });
    if (!complaint) throw new NotFoundException('Şikayet bulunamadı.');
    return complaint;
  }

  async updateStatus(id: string, dto: UpdateComplaintStatusDto, userId: string, userRole: UserRole): Promise<Complaint> {
    const complaint = await this.findOne(id);

    if (userRole === UserRole.CUSTOMER && complaint.customerId !== userId) {
      throw new ForbiddenException();
    }

    const oldStatus = complaint.status;
    await this.complaintRepo.update(id, { status: dto.status });

    await this.historyRepo.save(
      this.historyRepo.create({
        complaintId: id,
        userId,
        oldStatus,
        newStatus: dto.status,
        notes: dto.notes,
      }),
    );

    return this.findOne(id);
  }

  getHistory(id: string) {
    return this.historyRepo.find({
      where: { complaintId: id },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  private async buildPaginatedQuery(
    query: ComplaintQueryDto,
    extraWhere: Record<string, any> = {},
  ): Promise<PaginatedResult<Complaint>> {
    const { page = 1, limit = 20, status, cityId, priority, fromDate, toDate } = query;

    const qb = this.complaintRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.category', 'cat')
      .leftJoinAndSelect('c.city', 'city')
      .leftJoinAndSelect('cat.department', 'dept');

    Object.entries(extraWhere).forEach(([key, value]) => {
      qb.andWhere(`c.${key} = :${key}`, { [key]: value });
    });

    if (status) qb.andWhere('c.status = :status', { status });
    if (cityId) qb.andWhere('c.city_id = :cityId', { cityId });
    if (priority) qb.andWhere('c.priority = :priority', { priority });
    if (fromDate) qb.andWhere('c.created_at >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('c.created_at <= :toDate', { toDate });

    if (query.departmentId) {
      qb.andWhere('cat.department_id = :departmentId', { departmentId: query.departmentId });
    }

    qb.orderBy('c.created_at', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  private async getOrCreateGuestCustomerId(): Promise<string> {
    const existing = await this.userRepo.findOne({
      where: { email: ComplaintsService.GUEST_EMAIL },
    });
    if (existing) return existing.id;

    const guest = this.userRepo.create({
      email: ComplaintsService.GUEST_EMAIL,
      password: randomUUID(),
      name: 'Portal',
      surname: 'Misafir',
      role: UserRole.CUSTOMER,
      isActive: true,
    });
    const saved = await this.userRepo.save(guest);
    return saved.id;
  }
}
