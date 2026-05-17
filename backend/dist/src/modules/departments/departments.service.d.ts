import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentsService {
    private deptRepo;
    constructor(deptRepo: Repository<Department>);
    create(dto: CreateDepartmentDto): Promise<Department>;
    findAll(): Promise<Department[]>;
    findOne(id: string): Promise<Department>;
    update(id: string, dto: UpdateDepartmentDto): Promise<Department>;
    remove(id: string): Promise<void>;
}
