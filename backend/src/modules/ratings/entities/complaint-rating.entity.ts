import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Complaint } from '../../complaints/entities/complaint.entity';
import { User } from '../../users/entities/user.entity';

@Entity('complaint_ratings')
@Unique(['complaintId'])
@Index(['createdAt'])
export class ComplaintRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Complaint, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

  @Column({ name: 'complaint_id' })
  complaintId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string | null;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
