import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ResolutionProcess } from './entities/resolution-process.entity';
import { ResolutionProcessStep } from './entities/resolution-process-step.entity';
import { ComplaintResolutionStep } from './entities/complaint-resolution-step.entity';
import { City } from '../cities/entities/city.entity';
import { Category } from '../categories/entities/category.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { CreateResolutionProcessDto } from './dto/create-resolution-process.dto';
import { UpdateResolutionProcessDto } from './dto/update-resolution-process.dto';
import { CreateComplaintProcessDto } from './dto/create-complaint-process.dto';
import { ResolutionStepInput } from './dto/resolution-step.input';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ResolutionProcessesService {
  constructor(
    @InjectRepository(ResolutionProcess)
    private processRepo: Repository<ResolutionProcess>,
    @InjectRepository(ResolutionProcessStep)
    private stepRepo: Repository<ResolutionProcessStep>,
    @InjectRepository(ComplaintResolutionStep)
    private complaintStepRepo: Repository<ComplaintResolutionStep>,
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Complaint) private complaintRepo: Repository<Complaint>,
    private notifications: NotificationsGateway,
  ) {}

  // ---- Süreç şablonu CRUD ----

  async create(dto: CreateResolutionProcessDto): Promise<ResolutionProcess> {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Kategori bulunamadı.');

    if (!dto.appliesToAllCities && !dto.cityIds?.length) {
      throw new BadRequestException('En az bir şehir seçmelisiniz.');
    }

    await this.assertNoOverlap(
      dto.categoryId,
      dto.appliesToAllCities,
      dto.cityIds,
    );

    const cities = dto.appliesToAllCities
      ? []
      : await this.cityRepo.findBy({ id: In(dto.cityIds ?? []) });

    const process = this.processRepo.create({
      name: dto.name,
      categoryId: dto.categoryId,
      appliesToAllCities: dto.appliesToAllCities,
      cities,
      steps: this.buildSteps(dto.steps),
    });
    const saved = await this.processRepo.save(process);
    return this.findOne(saved.id);
  }

  findAll(categoryId?: string, cityId?: string): Promise<ResolutionProcess[]> {
    const qb = this.processRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.steps', 'step')
      .leftJoinAndSelect('p.cities', 'city')
      .leftJoinAndSelect('p.category', 'category')
      .where('p.isActive = true')
      .orderBy('p.createdAt', 'DESC')
      .addOrderBy('step.order', 'ASC');

    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    if (cityId) {
      qb.andWhere(
        '(p.appliesToAllCities = true OR EXISTS (SELECT 1 FROM resolution_process_cities rpc WHERE rpc.process_id = p.id AND rpc.city_id = :cityId))',
        { cityId },
      );
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<ResolutionProcess> {
    const process = await this.processRepo.findOne({
      where: { id },
      relations: ['steps', 'cities', 'category'],
    });
    if (!process) throw new NotFoundException('Çözüm süreci bulunamadı.');
    process.steps.sort((a, b) => a.order - b.order);
    return process;
  }

  async update(
    id: string,
    dto: UpdateResolutionProcessDto,
  ): Promise<ResolutionProcess> {
    const process = await this.findOne(id);

    if (dto.name !== undefined) process.name = dto.name;
    if (dto.isActive !== undefined) process.isActive = dto.isActive;

    const appliesToAllCities =
      dto.appliesToAllCities ?? process.appliesToAllCities;
    process.appliesToAllCities = appliesToAllCities;

    if (appliesToAllCities) {
      process.cities = [];
    } else if (dto.cityIds) {
      if (!dto.cityIds.length)
        throw new BadRequestException('En az bir şehir seçmelisiniz.');
      process.cities = await this.cityRepo.findBy({ id: In(dto.cityIds) });
    }

    await this.assertNoOverlap(
      process.categoryId,
      appliesToAllCities,
      appliesToAllCities ? undefined : process.cities.map((c) => c.id),
      id,
    );

    if (dto.steps) {
      await this.stepRepo.delete({ processId: id });
      process.steps = this.buildSteps(dto.steps);
    }

    await this.processRepo.save(process);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.processRepo.delete(id);
  }

  // Belirli kategori+şehir için geçerli süreci bulur. Şehir-özel süreç,
  // tüm-şehirler sürecine göre önceliklidir.
  async findApplicable(
    categoryId: string,
    cityId: string,
  ): Promise<ResolutionProcess | null> {
    const citySpecific = await this.processRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.steps', 'step')
      .where(
        'p.categoryId = :categoryId AND p.isActive = true AND p.appliesToAllCities = false',
        { categoryId },
      )
      .andWhere(
        'EXISTS (SELECT 1 FROM resolution_process_cities rpc WHERE rpc.process_id = p.id AND rpc.city_id = :cityId)',
        { cityId },
      )
      .orderBy('step.order', 'ASC')
      .getOne();
    if (citySpecific) return citySpecific;

    const allCities = await this.processRepo.findOne({
      where: { categoryId, appliesToAllCities: true, isActive: true },
      relations: ['steps'],
    });
    if (allCities) allCities.steps.sort((a, b) => a.order - b.order);
    return allCities ?? null;
  }

  // ---- Talep adımları ----

  // Talebe ait adımları döndürür; henüz yoksa ve uygun süreç varsa örnekler.
  async getOrInitComplaintSteps(
    complaintId: string,
  ): Promise<ComplaintResolutionStep[]> {
    const complaint = await this.complaintRepo.findOne({
      where: { id: complaintId },
    });
    if (!complaint) throw new NotFoundException('Şikayet bulunamadı.');

    let steps = await this.getComplaintSteps(complaintId);
    if (steps.length === 0) {
      await this.instantiateForComplaint(complaint);
      steps = await this.getComplaintSteps(complaintId);
    }
    return steps;
  }

  // Talep oluşturulurken otomatik çağrılır (varsa uygun süreci uygular).
  async instantiateForComplaint(complaint: Complaint): Promise<void> {
    if (!complaint.categoryId || !complaint.cityId) return;
    const existing = await this.complaintStepRepo.count({
      where: { complaintId: complaint.id },
    });
    if (existing > 0) return;

    const process = await this.findApplicable(
      complaint.categoryId,
      complaint.cityId,
    );
    if (!process) return;
    await this.instantiate(complaint.id, process);
  }

  async completeStep(
    complaintId: string,
    stepId: string,
    isCompleted: boolean,
    userId: string,
  ): Promise<ComplaintResolutionStep[]> {
    const step = await this.complaintStepRepo.findOne({
      where: { id: stepId, complaintId },
    });
    if (!step) throw new NotFoundException('Adım bulunamadı.');

    const steps = await this.getComplaintSteps(complaintId);

    if (isCompleted) {
      const prevIncomplete = steps.some(
        (s) => s.order < step.order && !s.isCompleted,
      );
      if (prevIncomplete) {
        throw new BadRequestException(
          'Önceki adımları tamamlamadan bu adımı tamamlayamazsınız.',
        );
      }
      step.isCompleted = true;
      step.completedAt = new Date();
      step.completedById = userId;
    } else {
      const laterCompleted = steps.some(
        (s) => s.order > step.order && s.isCompleted,
      );
      if (laterCompleted) {
        throw new BadRequestException(
          'Sonraki adımlar tamamlanmışken bu adımı geri alamazsınız.',
        );
      }
      step.isCompleted = false;
      step.completedAt = null;
      step.completedById = null;
    }

    await this.complaintStepRepo.save(step);
    const updatedSteps = await this.getComplaintSteps(complaintId);

    // Public takip sayfası için anlık güncelleme.
    const complaint = await this.complaintRepo.findOne({
      where: { id: complaintId },
      select: { trackingCode: true },
    });
    if (complaint?.trackingCode) {
      this.notifications.notifyTrack(complaint.trackingCode, 'track:updated', {
        type: 'step',
        stepId: step.id,
        order: step.order,
        title: step.title,
        isCompleted: step.isCompleted,
        at: new Date().toISOString(),
      });
    }

    return updatedSteps;
  }

  // Talep detayından anlık süreç tanımlama: yalnızca bu talebin kategorisi ve
  // şehri için bir süreç oluşturur ve adımları talebe uygular.
  async createForComplaint(
    complaintId: string,
    dto: CreateComplaintProcessDto,
  ): Promise<ComplaintResolutionStep[]> {
    const complaint = await this.complaintRepo.findOne({
      where: { id: complaintId },
    });
    if (!complaint) throw new NotFoundException('Şikayet bulunamadı.');
    if (!complaint.categoryId || !complaint.cityId) {
      throw new BadRequestException(
        'Şikayetin kategori veya şehir bilgisi eksik.',
      );
    }

    const created = await this.create({
      name: dto.name,
      categoryId: complaint.categoryId,
      appliesToAllCities: false,
      cityIds: [complaint.cityId],
      steps: dto.steps,
    });

    await this.complaintStepRepo.delete({ complaintId });
    await this.instantiate(complaintId, await this.findOne(created.id));
    return this.getComplaintSteps(complaintId);
  }

  // ---- yardımcılar ----

  private getComplaintSteps(
    complaintId: string,
  ): Promise<ComplaintResolutionStep[]> {
    return this.complaintStepRepo.find({
      where: { complaintId },
      order: { order: 'ASC' },
    });
  }

  private async instantiate(
    complaintId: string,
    process: ResolutionProcess,
  ): Promise<void> {
    const ordered = [...process.steps].sort((a, b) => a.order - b.order);
    const rows = ordered.map((s) =>
      this.complaintStepRepo.create({
        complaintId,
        processId: process.id,
        order: s.order,
        title: s.title,
        description: s.description ?? null,
      }),
    );
    await this.complaintStepRepo.save(rows);
  }

  private buildSteps(steps: ResolutionStepInput[]): ResolutionProcessStep[] {
    return steps.map((s, i) =>
      this.stepRepo.create({
        order: i + 1,
        title: s.title,
        description: s.description ?? null,
      }),
    );
  }

  private async assertNoOverlap(
    categoryId: string,
    appliesToAllCities: boolean,
    cityIds?: string[],
    excludeId?: string,
  ): Promise<void> {
    if (appliesToAllCities) {
      const existing = await this.processRepo.findOne({
        where: { categoryId, appliesToAllCities: true, isActive: true },
      });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException(
          'Bu kategori için zaten tüm şehirleri kapsayan bir süreç var.',
        );
      }
      return;
    }

    const existing = await this.processRepo.find({
      where: { categoryId, appliesToAllCities: false, isActive: true },
      relations: ['cities'],
    });
    const taken = new Set<string>();
    existing
      .filter((p) => p.id !== excludeId)
      .forEach((p) => p.cities.forEach((c) => taken.add(c.id)));

    const clash = (cityIds ?? []).filter((id) => taken.has(id));
    if (clash.length) {
      throw new ConflictException(
        'Seçilen şehirlerden bazıları için bu kategoride zaten bir süreç tanımlı.',
      );
    }
  }
}
