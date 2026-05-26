import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Complaint } from '../../complaints/entities/complaint.entity';
import { User } from '../../users/entities/user.entity';

@Entity('attachments')
@Index(['complaintId', 'createdAt'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Complaint, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

  @Column({ name: 'complaint_id' })
  complaintId: string;

  // Diskte saklanan dosya adı (UUID + uzantı).
  @Column({ name: 'storage_key' })
  storageKey: string;

  // Kullanıcının yüklediği orijinal isim (gösterim için).
  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  @Column({ name: 'uploaded_by_id', nullable: true })
  uploadedById: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
