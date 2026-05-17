import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffAvailability } from './entities/staff-availability.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StaffAvailabilityService {
  constructor(
    @InjectRepository(StaffAvailability) private availRepo: Repository<StaffAvailability>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getAvailableStaff(departmentId: string, cityId: string) {
    return this.availRepo
      .createQueryBuilder('sa')
      .innerJoinAndSelect('sa.staff', 'u')
      .where('u.department_id = :departmentId', { departmentId })
      .andWhere('u.city_id = :cityId', { cityId })
      .andWhere('u.is_active = true')
      .andWhere('sa.is_available = true')
      .andWhere('sa.current_load < sa.max_capacity')
      .orderBy('sa.current_load', 'ASC')
      .getMany();
  }

  async findByStaffId(staffId: string) {
    const avail = await this.availRepo.findOne({ where: { staffId } });
    if (!avail) throw new NotFoundException('Personel müsaitlik kaydı bulunamadı.');
    return avail;
  }

  async incrementLoad(staffId: string) {
    await this.availRepo.increment({ staffId }, 'currentLoad', 1);
  }

  async decrementLoad(staffId: string) {
    await this.availRepo
      .createQueryBuilder()
      .update(StaffAvailability)
      .set({ currentLoad: () => 'GREATEST(current_load - 1, 0)' })
      .where('staff_id = :staffId', { staffId })
      .execute();
  }

  async toggleAvailability(staffId: string) {
    const avail = await this.findByStaffId(staffId);
    avail.isAvailable = !avail.isAvailable;
    return this.availRepo.save(avail);
  }

  async syncFromDatabase(staffId: string) {
    const count = await this.userRepo.manager
      .createQueryBuilder()
      .select('COUNT(a.id)', 'cnt')
      .from('assignments', 'a')
      .where('a.staff_id = :staffId', { staffId })
      .andWhere('a.is_active = true')
      .getRawOne();

    await this.availRepo.update({ staffId }, { currentLoad: parseInt(count?.cnt || '0', 10) });
  }
}
