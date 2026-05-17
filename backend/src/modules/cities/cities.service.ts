import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(@InjectRepository(City) private cityRepo: Repository<City>) {}

  findAll() {
    return this.cityRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const city = await this.cityRepo.findOne({ where: { id } });
    if (!city) throw new NotFoundException('Şehir bulunamadı.');
    return city;
  }
}
