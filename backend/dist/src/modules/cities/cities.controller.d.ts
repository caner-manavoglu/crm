import { CitiesService } from './cities.service';
export declare class CitiesController {
    private citiesService;
    constructor(citiesService: CitiesService);
    findAll(): Promise<import("./entities/city.entity").City[]>;
    findOne(id: string): Promise<import("./entities/city.entity").City>;
}
