import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private catRepo: Repository<Category>,
  ) {}

  create(dto: CreateCategoryDto) {
    return this.catRepo.save(this.catRepo.create(dto));
  }

  findAll(departmentId?: string) {
    const where: any = { isActive: true };
    if (departmentId) where.departmentId = departmentId;
    return this.catRepo.find({
      where,
      relations: ['department'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const cat = await this.catRepo.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!cat) throw new NotFoundException('Kategori bulunamadı.');
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    await this.catRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.catRepo.update(id, { isActive: false });
  }
}
