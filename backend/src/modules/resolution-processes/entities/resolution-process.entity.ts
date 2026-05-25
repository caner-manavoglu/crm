import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { City } from '../../cities/entities/city.entity';
import { ResolutionProcessStep } from './resolution-process-step.entity';

// Bir kategoriye ait, belirli şehirler (veya tüm şehirler) için geçerli, sıralı
// adımlardan oluşan çözüm süreci şablonu.
@Entity('resolution_processes')
export class ResolutionProcess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Category, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  categoryId: string;

  // true ise tüm şehirler için geçerlidir ve `cities` boş kalır.
  @Column({ name: 'applies_to_all_cities', default: false })
  appliesToAllCities: boolean;

  @ManyToMany(() => City)
  @JoinTable({
    name: 'resolution_process_cities',
    joinColumn: { name: 'process_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'city_id', referencedColumnName: 'id' },
  })
  cities: City[];

  @OneToMany(() => ResolutionProcessStep, (s) => s.process, { cascade: true })
  steps: ResolutionProcessStep[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
