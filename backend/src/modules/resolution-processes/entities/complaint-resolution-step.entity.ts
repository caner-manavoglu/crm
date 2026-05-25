import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Complaint } from '../../complaints/entities/complaint.entity';
import { User } from '../../users/entities/user.entity';

// Bir talebe uygulanmış çözüm sürecinin adım örneği. Şablondan kopyalanır;
// böylece şablon sonradan değişse bile devam eden talep etkilenmez.
@Entity('complaint_resolution_steps')
export class ComplaintResolutionStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Complaint, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

  @Column({ name: 'complaint_id' })
  complaintId: string;

  @Column({ name: 'process_id', nullable: true })
  processId: string;

  @Column({ name: 'step_order', type: 'int' })
  order: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'completed_by_id' })
  completedBy: User;

  @Column({ name: 'completed_by_id', nullable: true })
  completedById: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
