import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Complaint } from './entities/complaint.entity';
import { ComplaintHistory } from './entities/complaint-history.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { ComplaintQueryDto } from './dto/complaint-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { UserRole } from '../../common/enums/user-role.enum';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';
import { User } from '../users/entities/user.entity';
import { AssignmentsService } from '../assignments/assignments.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ResolutionProcessesService } from '../resolution-processes/resolution-processes.service';
import { RatingsService } from '../ratings/ratings.service';

type QueryValue = string | number | boolean | Date | null;

@Injectable()
export class ComplaintsService {
  // İleri yönlü geçerli durum geçişleri (staff/müşteri için zorunlu, admin muaf).
  private static readonly ALLOWED_TRANSITIONS: Record<
    ComplaintStatus,
    ComplaintStatus[]
  > = {
    [ComplaintStatus.PENDING]: [ComplaintStatus.ASSIGNED],
    [ComplaintStatus.ASSIGNED]: [ComplaintStatus.IN_PROGRESS],
    [ComplaintStatus.IN_PROGRESS]: [ComplaintStatus.RESOLVED],
    [ComplaintStatus.RESOLVED]: [ComplaintStatus.CLOSED],
    [ComplaintStatus.CLOSED]: [],
  };

  constructor(
    @InjectRepository(Complaint) private complaintRepo: Repository<Complaint>,
    @InjectRepository(ComplaintHistory)
    private historyRepo: Repository<ComplaintHistory>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private assignmentsService: AssignmentsService,
    private notifications: NotificationsGateway,
    private resolutionProcesses: ResolutionProcessesService,
    private ratingsService: RatingsService,
  ) {}

  async create(
    dto: CreateComplaintDto,
    customerId?: string,
  ): Promise<Complaint> {
    const resolvedCustomerId = await this.resolveCustomerId(dto, customerId);

    const complaint = this.complaintRepo.create({
      title: dto.title,
      content: dto.content,
      address: dto.address,
      categoryId: dto.categoryId,
      cityId: dto.cityId,
      priority: dto.priority,
      customerId: resolvedCustomerId,
      trackingCode: await this.generateUniqueTrackingCode(),
    });
    const saved = await this.complaintRepo.save(complaint);

    await this.historyRepo.save(
      this.historyRepo.create({
        complaintId: saved.id,
        userId: resolvedCustomerId,
        newStatus: saved.status,
        notes: customerId
          ? 'Şikayet oluşturuldu.'
          : 'Portal üzerinden şikayet oluşturuldu.',
      }),
    );

    // Bu kategori+şehir için tanımlı bir çözüm süreci varsa adımları talebe uygula.
    await this.resolutionProcesses.instantiateForComplaint(saved);

    // Adminlere yeni şikayet bildirimi (otomatik atanmazsa havuzda görünür).
    this.notifications.notifyAdmins('notification:new', {
      type: 'complaint',
      message: `Yeni şikayet: ${saved.title}`,
    });

    return saved;
  }

  async findAll(query: ComplaintQueryDto): Promise<PaginatedResult<Complaint>> {
    return this.buildPaginatedQuery(query);
  }

  async findByCustomer(
    customerId: string,
    query: ComplaintQueryDto,
  ): Promise<PaginatedResult<Complaint>> {
    return this.buildPaginatedQuery(query, { customerId });
  }

  async findOne(id: string): Promise<Complaint> {
    const complaint = await this.complaintRepo.findOne({
      where: { id },
      relations: ['category', 'category.department', 'customer', 'city'],
    });
    if (!complaint) throw new NotFoundException('Şikayet bulunamadı.');
    return complaint;
  }

  // Müşteri yalnızca kendi şikayetini görebilir; staff ve admin tümünü görebilir.
  async findOneForUser(id: string, user: User): Promise<Complaint> {
    const complaint = await this.findOne(id);
    if (user.role === UserRole.CUSTOMER && complaint.customerId !== user.id) {
      throw new ForbiddenException('Bu şikayete erişim yetkiniz yok.');
    }
    return complaint;
  }

  async getHistoryForUser(id: string, user: User) {
    await this.findOneForUser(id, user); // erişim kontrolü
    return this.getHistory(id);
  }

  async updateStatus(
    id: string,
    dto: UpdateComplaintStatusDto,
    user: User,
  ): Promise<Complaint> {
    const complaint = await this.findOne(id);
    await this.assertCanUpdateStatus(complaint, dto.status, user);

    const oldStatus = complaint.status;
    await this.complaintRepo.update(id, { status: dto.status });

    // Şikayet kapanınca atamayı serbest bırak ve personel yükünü azalt (kapasite sızıntısını önler).
    if (
      dto.status === ComplaintStatus.RESOLVED ||
      dto.status === ComplaintStatus.CLOSED
    ) {
      await this.assignmentsService.releaseAssignment(id);
    }

    await this.historyRepo.save(
      this.historyRepo.create({
        complaintId: id,
        userId: user.id,
        oldStatus,
        newStatus: dto.status,
        notes: dto.notes,
      }),
    );

    // Müşteriye durum değişikliği bildirimi.
    this.notifications.notifyUser(complaint.customerId, 'notification:new', {
      type: 'status',
      message: `Şikayetinizin durumu güncellendi: ${dto.status}`,
      complaintId: id,
    });

    // Takip kodu odasına anlık güncelleme (public tracking page için).
    this.notifications.notifyTrack(complaint.trackingCode, 'track:updated', {
      type: 'status',
      oldStatus,
      newStatus: dto.status,
      notes: dto.notes,
      at: new Date().toISOString(),
    });

    return this.findOne(id);
  }

  // Admin tarafından alan güncellemesi. Şehir değişirse mevcut atama serbest bırakılır
  // ve geçmişe not düşülür (yeniden atama akışı için talep havuza döner).
  async update(
    id: string,
    dto: UpdateComplaintDto,
    user: User,
  ): Promise<Complaint> {
    const complaint = await this.findOne(id);

    const patch: Partial<Complaint> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.content !== undefined) patch.content = dto.content;
    if (dto.priority !== undefined) patch.priority = dto.priority;
    if (dto.categoryId !== undefined) patch.categoryId = dto.categoryId;

    const cityChanged =
      dto.cityId !== undefined && dto.cityId !== complaint.cityId;
    if (dto.cityId !== undefined) patch.cityId = dto.cityId;

    if (Object.keys(patch).length === 0) return complaint;

    await this.complaintRepo.update(id, patch);

    if (cityChanged) {
      await this.assignmentsService.releaseAssignment(id);
      await this.complaintRepo.update(id, { status: ComplaintStatus.PENDING });
      await this.historyRepo.save(
        this.historyRepo.create({
          complaintId: id,
          userId: user.id,
          oldStatus: complaint.status,
          newStatus: ComplaintStatus.PENDING,
          notes: 'Şikayet farklı şehre yönlendirildi, havuza alındı.',
        }),
      );
      this.notifications.notifyTrack(complaint.trackingCode, 'track:updated', {
        type: 'transfer',
        notes: 'Şikayet farklı şehre yönlendirildi.',
        at: new Date().toISOString(),
      });
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const complaint = await this.findOne(id);
    await this.assignmentsService.releaseAssignment(id);
    await this.complaintRepo.delete(complaint.id);
  }

  getHistory(id: string) {
    return this.historyRepo.find({
      where: { complaintId: id },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  // Takip kodu ile public sorgu — kişisel veri sızdırmamak için sadece gerekli alanlar.
  async findByTrackingCode(code: string) {
    const complaint = await this.complaintRepo.findOne({
      where: { trackingCode: code.toUpperCase() },
      relations: ['category', 'category.department', 'city'],
    });
    if (!complaint) throw new NotFoundException('Talep bulunamadı.');

    const steps = await this.resolutionProcesses.getOrInitComplaintSteps(
      complaint.id,
    );
    const history = await this.historyRepo.find({
      where: { complaintId: complaint.id },
      order: { createdAt: 'ASC' },
    });
    const rating = await this.ratingsService.findByComplaint(complaint.id);

    return {
      trackingCode: complaint.trackingCode,
      title: complaint.title,
      content: complaint.content,
      address: complaint.address,
      status: complaint.status,
      priority: complaint.priority,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      category: complaint.category
        ? { id: complaint.category.id, name: complaint.category.name }
        : null,
      department: complaint.category?.department
        ? {
            id: complaint.category.department.id,
            name: complaint.category.department.name,
          }
        : null,
      city: complaint.city
        ? { id: complaint.city.id, name: complaint.city.name }
        : null,
      steps,
      history: history.map((h) => ({
        oldStatus: h.oldStatus,
        newStatus: h.newStatus,
        notes: h.notes,
        createdAt: h.createdAt,
      })),
      rating: rating
        ? {
            score: rating.score,
            comment: rating.comment,
            createdAt: rating.createdAt,
          }
        : null,
    };
  }

  // 6 karakter, kullanıcı dostu (karışan karakterleri çıkardık: 0/O, 1/I, L).
  private async generateUniqueTrackingCode(): Promise<string> {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    for (let attempt = 0; attempt < 6; attempt++) {
      let code = 'CRM-';
      for (let i = 0; i < 6; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      const existing = await this.complaintRepo.findOne({
        where: { trackingCode: code },
        select: { id: true },
      });
      if (!existing) return code;
    }
    throw new BadRequestException('Takip kodu üretilemedi, tekrar deneyin.');
  }

  // Rol bazlı yetki + geçerli durum geçişi kontrolü.
  private async assertCanUpdateStatus(
    complaint: Complaint,
    newStatus: ComplaintStatus,
    user: User,
  ): Promise<void> {
    if (user.role === UserRole.ADMIN) {
      return; // admin her geçişi yapabilir
    }

    if (user.role === UserRole.CUSTOMER) {
      if (complaint.customerId !== user.id) {
        throw new ForbiddenException('Bu şikayete erişim yetkiniz yok.');
      }
      // Müşteri yalnızca kendi çözülmüş şikayetini kapatabilir.
      if (
        !(
          complaint.status === ComplaintStatus.RESOLVED &&
          newStatus === ComplaintStatus.CLOSED
        )
      ) {
        throw new ForbiddenException('Bu durum değişikliğine izniniz yok.');
      }
      return;
    }

    // STAFF: yalnızca kendisine aktif olarak atanmış şikayetlerde işlem yapabilir.
    const assignment = await this.assignmentsService.findByComplaintId(
      complaint.id,
    );
    if (!assignment || assignment.staffId !== user.id) {
      throw new ForbiddenException('Bu şikayet size atanmamış.');
    }
    this.assertValidTransition(complaint.status, newStatus);
  }

  private assertValidTransition(
    from: ComplaintStatus,
    to: ComplaintStatus,
  ): void {
    const allowed = ComplaintsService.ALLOWED_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(`Geçersiz durum geçişi: ${from} → ${to}`);
    }
  }

  private async buildPaginatedQuery(
    query: ComplaintQueryDto,
    extraWhere: Record<string, QueryValue> = {},
  ): Promise<PaginatedResult<Complaint>> {
    const {
      page = 1,
      limit = 20,
      status,
      cityId,
      priority,
      fromDate,
      toDate,
    } = query;

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

    if (query.q && query.q.trim()) {
      const term = `%${query.q.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(c.title) LIKE :term OR LOWER(c.content) LIKE :term OR LOWER(c.tracking_code) LIKE :term OR LOWER(cat.name) LIKE :term)',
        { term },
      );
    }

    if (query.departmentId) {
      qb.andWhere('cat.department_id = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    qb.orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private async resolveCustomerId(
    dto: CreateComplaintDto,
    customerId?: string,
  ): Promise<string> {
    if (customerId) return customerId;

    const normalizedEmail = dto.customerEmail.trim().toLowerCase();
    const existing = await this.userRepo.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.role !== UserRole.CUSTOMER) {
        throw new BadRequestException(
          'Bu e-posta personel/admin hesabına ait. Farklı bir e-posta kullanın.',
        );
      }

      const updated = this.userRepo.merge(existing, {
        name: dto.customerName.trim(),
        surname: dto.customerSurname.trim(),
        phone: dto.customerPhone?.trim() || undefined,
      });
      const saved = await this.userRepo.save(updated);
      return saved.id;
    }

    const customer = this.userRepo.create({
      email: normalizedEmail,
      password: randomUUID(),
      name: dto.customerName.trim(),
      surname: dto.customerSurname.trim(),
      phone: dto.customerPhone?.trim() || undefined,
      role: UserRole.CUSTOMER,
      isActive: true,
    });
    const saved = await this.userRepo.save(customer);
    return saved.id;
  }
}
