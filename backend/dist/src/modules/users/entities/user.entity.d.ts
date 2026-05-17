import { UserRole } from '../../../common/enums/user-role.enum';
import { Department } from '../../departments/entities/department.entity';
import { City } from '../../cities/entities/city.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    surname: string;
    role: UserRole;
    department: Department;
    departmentId: string;
    city: City;
    cityId: string;
    phone: string;
    isActive: boolean;
    createdAt: Date;
    hashPassword(): Promise<void>;
    comparePassword(plain: string): Promise<boolean>;
}
