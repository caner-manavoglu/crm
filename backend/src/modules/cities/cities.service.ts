import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(@InjectRepository(City) private cityRepo: Repository<City>) {}

  async create(dto: CreateCityDto) {
    const name = dto.name.trim();
    const code = dto.code.trim();

    const existingName = await this.cityRepo.findOne({ where: { name } });
    if (existingName) throw new ConflictException('Bu şehir adı zaten kullanılıyor.');

    const existingCode = await this.cityRepo.findOne({ where: { code } });
    if (existingCode) throw new ConflictException('Bu şehir kodu zaten kullanılıyor.');

    return this.cityRepo.save(
      this.cityRepo.create({
        ...dto,
        name,
        code,
      }),
    );
  }

  findAll() {
    return this.cityRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const city = await this.cityRepo.findOne({ where: { id, isActive: true } });
    if (!city) throw new NotFoundException('Şehir bulunamadı.');
    return city;
  }

  async update(id: string, dto: UpdateCityDto) {
    const city = await this.findOne(id);

    if (dto.name) {
      const name = dto.name.trim();
      const existingName = await this.cityRepo.findOne({ where: { name } });
      if (existingName && existingName.id !== id) {
        throw new ConflictException('Bu şehir adı zaten kullanılıyor.');
      }
      city.name = name;
    }

    if (dto.code) {
      const code = dto.code.trim();
      const existingCode = await this.cityRepo.findOne({ where: { code } });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException('Bu şehir kodu zaten kullanılıyor.');
      }
      city.code = code;
    }

    if (typeof dto.isActive === 'boolean') {
      city.isActive = dto.isActive;
    }

    await this.cityRepo.save(city);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.cityRepo.update(id, { isActive: false });
  }
}
