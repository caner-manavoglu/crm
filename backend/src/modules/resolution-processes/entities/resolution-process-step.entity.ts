import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResolutionProcess } from './resolution-process.entity';

// Çözüm süreci şablonundaki sıralı tek bir adım.
@Entity('resolution_process_steps')
export class ResolutionProcessStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ResolutionProcess, (p) => p.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'process_id' })
  process: ResolutionProcess;

  @Column({ name: 'process_id' })
  processId: string;

  @Column({ name: 'step_order', type: 'int' })
  order: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
