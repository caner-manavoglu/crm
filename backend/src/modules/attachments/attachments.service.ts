import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { Attachment } from './entities/attachment.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { NotificationsGateway } from '../notifications/notifications.gateway';

export const ATTACHMENT_DIR = join(process.cwd(), 'uploads', 'attachments');
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepo: Repository<Attachment>,
    @InjectRepository(Complaint)
    private complaintRepo: Repository<Complaint>,
    private notifications: NotificationsGateway,
  ) {}

  async listForComplaint(complaintId: string, user: User) {
    const complaint = await this.getComplaint(complaintId);
    this.assertCanRead(complaint, user);
    return this.attachmentRepo.find({
      where: { complaintId },
      order: { createdAt: 'DESC' },
    });
  }

  async listForTracking(code: string) {
    const complaint = await this.complaintRepo.findOne({
      where: { trackingCode: code.toUpperCase() },
      select: { id: true, trackingCode: true },
    });
    if (!complaint) throw new NotFoundException('Talep bulunamadı.');
    return this.attachmentRepo.find({
      where: { complaintId: complaint.id },
      order: { createdAt: 'DESC' },
    });
  }

  async uploadForComplaint(
    complaintId: string,
    file: Express.Multer.File,
    user: User,
  ): Promise<Attachment> {
    const complaint = await this.getComplaint(complaintId);
    this.assertCanRead(complaint, user); // okuma erişimi = upload yetkisi
    return this.persist(complaint, file, user.id);
  }

  async uploadForTracking(
    code: string,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const complaint = await this.complaintRepo.findOne({
      where: { trackingCode: code.toUpperCase() },
    });
    if (!complaint) throw new NotFoundException('Talep bulunamadı.');
    return this.persist(complaint, file, null);
  }

  async getForDownload(
    id: string,
    user: User,
  ): Promise<{ attachment: Attachment; absolutePath: string }> {
    const attachment = await this.attachmentRepo.findOne({ where: { id } });
    if (!attachment) throw new NotFoundException('Dosya bulunamadı.');
    const complaint = await this.getComplaint(attachment.complaintId);
    this.assertCanRead(complaint, user);
    return {
      attachment,
      absolutePath: join(ATTACHMENT_DIR, attachment.storageKey),
    };
  }

  async getForTrackingDownload(
    code: string,
    id: string,
  ): Promise<{ attachment: Attachment; absolutePath: string }> {
    const attachment = await this.attachmentRepo.findOne({ where: { id } });
    if (!attachment) throw new NotFoundException('Dosya bulunamadı.');
    const complaint = await this.complaintRepo.findOne({
      where: { id: attachment.complaintId },
      select: { id: true, trackingCode: true },
    });
    if (!complaint || complaint.trackingCode !== code.toUpperCase()) {
      throw new ForbiddenException('Bu dosyaya erişim yetkiniz yok.');
    }
    return {
      attachment,
      absolutePath: join(ATTACHMENT_DIR, attachment.storageKey),
    };
  }

  async remove(id: string, user: User): Promise<void> {
    const attachment = await this.attachmentRepo.findOne({ where: { id } });
    if (!attachment) throw new NotFoundException('Dosya bulunamadı.');

    if (
      user.role !== UserRole.ADMIN &&
      attachment.uploadedById !== user.id
    ) {
      throw new ForbiddenException('Bu dosyayı silme yetkiniz yok.');
    }

    await this.attachmentRepo.delete(id);
    try {
      await fs.unlink(join(ATTACHMENT_DIR, attachment.storageKey));
    } catch {
      // Diskten silinemese de DB kaydı gitti — sessiz geç.
    }
  }

  private async persist(
    complaint: Complaint,
    file: Express.Multer.File,
    uploaderId: string | null,
  ): Promise<Attachment> {
    if (!file) throw new BadRequestException('Dosya gerekli.');
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Dosya boyutu 10MB üzerinde olamaz.');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Sadece JPG, PNG, WEBP ve PDF dosyaları kabul edilir.',
      );
    }

    await fs.mkdir(ATTACHMENT_DIR, { recursive: true });
    const ext = extname(file.originalname) || '';
    const storageKey = `${randomUUID()}${ext.toLowerCase()}`;
    await fs.writeFile(join(ATTACHMENT_DIR, storageKey), file.buffer);

    const saved = await this.attachmentRepo.save(
      this.attachmentRepo.create({
        complaintId: complaint.id,
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedById: uploaderId,
      }),
    );

    // Track odasına ek bilgisini de yayınla (public sayfadaki müşteri görsün).
    this.notifications.notifyTrack(complaint.trackingCode, 'track:updated', {
      type: 'attachment',
      attachmentId: saved.id,
      at: new Date().toISOString(),
    });
    this.notifications.notifyComplaintThread(complaint.id, 'attachment:new', {
      id: saved.id,
      originalName: saved.originalName,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
      createdAt: saved.createdAt,
    });

    return saved;
  }

  private async getComplaint(id: string): Promise<Complaint> {
    const complaint = await this.complaintRepo.findOne({
      where: { id },
      select: { id: true, customerId: true, trackingCode: true },
    });
    if (!complaint) throw new NotFoundException('Şikayet bulunamadı.');
    return complaint;
  }

  private assertCanRead(complaint: Complaint, user: User) {
    if (
      user.role === UserRole.CUSTOMER &&
      complaint.customerId !== user.id
    ) {
      throw new ForbiddenException('Bu talebe erişim yetkiniz yok.');
    }
  }
}
