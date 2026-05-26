import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment, Complaint]),
    NotificationsModule,
  ],
  providers: [AttachmentsService],
  controllers: [AttachmentsController],
})
export class AttachmentsModule {}
