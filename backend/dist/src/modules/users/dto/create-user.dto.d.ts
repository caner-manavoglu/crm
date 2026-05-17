import { UserRole } from '../../../common/enums/user-role.enum';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    surname: string;
    role?: UserRole;
    departmentId?: string;
    cityId?: string;
    phone?: string;
    isActive?: boolean;
}
