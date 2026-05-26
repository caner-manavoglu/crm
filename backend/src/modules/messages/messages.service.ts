import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintMessage } from './entities/complaint-message.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(ComplaintMessage)
    private messageRepo: Repository<ComplaintMessage>,
    @InjectRepository(Complaint)
    private complaintRepo: Repository<Complaint>,
    private notifications: NotificationsGateway,
  ) {}

  async list(complaintId: string, user: User): Promise<ComplaintMessage[]> {
    await this.assertAccess(complaintId, user);
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .where('m.complaintId = :complaintId', { complaintId })
      .orderBy('m.createdAt', 'ASC');

    if (user.role === UserRole.CUSTOMER) {
      qb.andWhere('m.isInternal = false');
    }

    return qb.getMany();
  }

  async create(
    complaintId: string,
    dto: CreateMessageDto,
    user: User,
  ): Promise<ComplaintMessage> {
    await this.assertAccess(complaintId, user);

    // Müşteri iç not gönderemez.
    const isInternal =
      user.role !== UserRole.CUSTOMER && dto.isInternal === true;

    const saved = await this.messageRepo.save(
      this.messageRepo.create({
        complaintId,
        senderId: user.id,
        body: dto.body.trim(),
        isInternal,
      }),
    );

    const populated = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });

    // Socket: ilgili thread'e canlı yayın.
    this.notifications.notifyComplaintThread(complaintId, 'message:new', {
      id: populated?.id,
      complaintId,
      body: populated?.body,
      isInternal: populated?.isInternal,
      sender: populated?.sender
        ? {
            id: populated.sender.id,
            name: populated.sender.name,
            surname: populated.sender.surname,
            role: populated.sender.role,
          }
        : null,
      createdAt: populated?.createdAt,
    });

    return populated!;
  }

  private async assertAccess(complaintId: string, user: User) {
    const complaint = await this.complaintRepo.findOne({
      where: { id: complaintId },
      select: { id: true, customerId: true },
    });
    if (!complaint) throw new NotFoundException('Şikayet bulunamadı.');
    if (
      user.role === UserRole.CUSTOMER &&
      complaint.customerId !== user.id
    ) {
      throw new ForbiddenException('Bu şikayete erişim yetkiniz yok.');
    }
  }
}
