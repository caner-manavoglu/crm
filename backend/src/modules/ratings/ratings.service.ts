import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintRating } from './entities/complaint-rating.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateRatingDto } from './dto/create-rating.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(ComplaintRating)
    private ratingRepo: Repository<ComplaintRating>,
    @InjectRepository(Complaint)
    private complaintRepo: Repository<Complaint>,
    private notifications: NotificationsGateway,
  ) {}

  async create(
    complaintId: string,
    dto: CreateRatingDto,
    user: User,
  ): Promise<ComplaintRating> {
    const complaint = await this.complaintRepo.findOne({
      where: { id: complaintId },
    });
    if (!complaint) throw new NotFoundException('Şikayet bulunamadı.');

    if (
      user.role !== UserRole.CUSTOMER ||
      complaint.customerId !== user.id
    ) {
      throw new ForbiddenException('Sadece şikayet sahibi puan verebilir.');
    }

    if (
      complaint.status !== ComplaintStatus.RESOLVED &&
      complaint.status !== ComplaintStatus.CLOSED
    ) {
      throw new BadRequestException(
        'Yalnızca çözülen veya kapatılan talepler puanlanabilir.',
      );
    }

    const existing = await this.ratingRepo.findOne({ where: { complaintId } });
    if (existing) {
      throw new ConflictException('Bu talep zaten puanlandı.');
    }

    const saved = await this.ratingRepo.save(
      this.ratingRepo.create({
        complaintId,
        customerId: user.id,
        score: dto.score,
        comment: dto.comment?.trim() || null,
      }),
    );

    this.notifications.notifyTrack(complaint.trackingCode, 'track:updated', {
      type: 'rating',
      score: saved.score,
      at: new Date().toISOString(),
    });
    this.notifications.notifyAdmins('notification:new', {
      type: 'rating',
      message: `Yeni müşteri puanı: ${saved.score}/5 — ${complaint.title}`,
    });

    return saved;
  }

  async findByComplaint(complaintId: string): Promise<ComplaintRating | null> {
    return this.ratingRepo.findOne({ where: { complaintId } });
  }

  async findByTrackingCode(code: string): Promise<ComplaintRating | null> {
    const complaint = await this.complaintRepo.findOne({
      where: { trackingCode: code.toUpperCase() },
      select: { id: true },
    });
    if (!complaint) return null;
    return this.ratingRepo.findOne({ where: { complaintId: complaint.id } });
  }

  // Analytics: ortalama + dağılım.
  async stats() {
    const ratings = await this.ratingRepo.find();
    if (ratings.length === 0) {
      return {
        total: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const r of ratings) {
      sum += r.score;
      distribution[r.score] = (distribution[r.score] || 0) + 1;
    }
    return {
      total: ratings.length,
      average: Math.round((sum / ratings.length) * 100) / 100,
      distribution,
    };
  }
}
