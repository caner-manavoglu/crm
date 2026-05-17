import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(StaffAvailability) private availabilityRepo: Repository<StaffAvailability>,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Bu e-posta zaten kullanılıyor.');

    const user = this.userRepo.create(dto);
    await this.userRepo.save(user);

    if (user.role === UserRole.STAFF) {
      const availability = this.availabilityRepo.create({ staffId: user.id });
      await this.availabilityRepo.save(availability);
    }

    return user;
  }

  findAll(role?: UserRole) {
    const where = role ? { role, isActive: true } : {};
    return this.userRepo.find({
      where,
      relations: ['department', 'city'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['department', 'city'],
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    await this.userRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepo.update(id, { isActive: false });
  }
}
