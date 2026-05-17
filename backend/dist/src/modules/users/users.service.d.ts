import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class UsersService {
    private userRepo;
    private availabilityRepo;
    constructor(userRepo: Repository<User>, availabilityRepo: Repository<StaffAvailability>);
    create(dto: CreateUserDto): Promise<User>;
    findAll(role?: UserRole): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
}
