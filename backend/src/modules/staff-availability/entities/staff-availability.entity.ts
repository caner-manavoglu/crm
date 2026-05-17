import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('staff_availability')
export class StaffAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @Column({ name: 'staff_id', unique: true })
  staffId: string;

  @Column({ name: 'current_load', default: 0 })
  currentLoad: number;

  @Column({ name: 'max_capacity', default: 4 })
  maxCapacity: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;
}
