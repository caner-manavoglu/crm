import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
export declare class CitiesService {
    private cityRepo;
    constructor(cityRepo: Repository<City>);
    findAll(): Promise<City[]>;
    findOne(id: string): Promise<City>;
}
