import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ComplaintStatus } from '../../../common/enums/complaint-status.enum';
import { ComplaintPriority } from '../../../common/enums/complaint-priority.enum';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { City } from '../../cities/entities/city.entity';
import { ComplaintHistory } from './complaint-history.entity';

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tracking_code', unique: true, length: 12, nullable: true })
  trackingCode: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', default: '' })
  address: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING,
  })
  status: ComplaintStatus;

  @Column({
    type: 'enum',
    enum: ComplaintPriority,
    default: ComplaintPriority.MEDIUM,
  })
  priority: ComplaintPriority;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Category, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => City, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'city_id', nullable: true })
  cityId: string;

  @OneToMany(() => ComplaintHistory, (h) => h.complaint, { cascade: true })
  history: ComplaintHistory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
