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

@Entity('complaint_messages')
@Index(['complaintId', 'createdAt'])
export class ComplaintMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Complaint, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

  @Column({ name: 'complaint_id' })
  complaintId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id', nullable: true })
  senderId: string | null;

  @Column({ type: 'text' })
  body: string;

  // Sadece staff/admin görür. Müşteriye gösterilmez.
  @Column({ name: 'is_internal', default: false })
  isInternal: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
