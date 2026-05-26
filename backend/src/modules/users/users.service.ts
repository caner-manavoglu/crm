import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(StaffAvailability)
    private availabilityRepo: Repository<StaffAvailability>,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Bu e-posta zaten kullanılıyor.');

    const user = this.userRepo.create(dto);
    await this.userRepo.save(user);

    if (user.role === UserRole.STAFF) {
      const availability = this.availabilityRepo.create({ staffId: user.id });
      await this.availabilityRepo.save(availability);
    }

    return user;
  }

  async findAll(query: UserQueryDto): Promise<PaginatedResult<User>> {
    const {
      role,
      cityId,
      departmentId,
      search,
      page = 1,
      limit = 20,
    } = query;

    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.department', 'department')
      .leftJoinAndSelect('u.city', 'city');

    if (role) {
      qb.andWhere('u.role = :role', { role });
      qb.andWhere('u.isActive = true');
    }

    if (cityId) {
      qb.andWhere('u.city_id = :cityId', { cityId });
    }

    if (departmentId) {
      qb.andWhere('u.department_id = :departmentId', { departmentId });
    }

    const searchTerm = search?.trim().toLowerCase();
    if (searchTerm) {
      qb.andWhere(
        `(LOWER(u.name) LIKE :term
          OR LOWER(u.surname) LIKE :term
          OR LOWER(u.email) LIKE :term
          OR LOWER(department.name) LIKE :term
          OR LOWER(city.name) LIKE :term)`,
        { term: `%${searchTerm}%` },
      );
    }

    qb.orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
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
    // userRepo.update(), entity'deki @BeforeUpdate hashPassword hook'unu tetiklemez;
    // bu yüzden şifre verildiyse burada manuel hash'lenir (düz metin kaydını önler).
    const data: Partial<User> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 12);
    }
    await this.userRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepo.update(id, { isActive: false });
  }
}
