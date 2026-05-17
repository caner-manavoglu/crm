import { Department } from '../../departments/entities/department.entity';
export declare class Category {
    id: string;
    name: string;
    description: string;
    department: Department;
    departmentId: string;
    isActive: boolean;
}
