import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ComplaintStatus } from '../../../common/enums/complaint-status.enum';
import { User } from '../../users/entities/user.entity';

@Entity('complaint_history')
export class ComplaintHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Complaint', 'history', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'complaint_id' })
  complaint: any;

  @Column({ name: 'complaint_id' })
  complaintId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    nullable: true,
    name: 'old_status',
  })
  oldStatus: ComplaintStatus;

  @Column({ type: 'enum', enum: ComplaintStatus, name: 'new_status' })
  newStatus: ComplaintStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
