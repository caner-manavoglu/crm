import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private deptRepo: Repository<Department>,
  ) {}

  create(dto: CreateDepartmentDto) {
    return this.deptRepo.save(this.deptRepo.create(dto));
  }

  findAll() {
    return this.deptRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const dept = await this.deptRepo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Departman bulunamadı.');
    return dept;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findOne(id);
    await this.deptRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.deptRepo.update(id, { isActive: false });
  }
}
