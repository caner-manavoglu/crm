import { UserRole } from '../../../common/enums/user-role.enum';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    surname: string;
    role?: UserRole;
    departmentId?: string;
    cityId?: string;
    phone?: string;
}
