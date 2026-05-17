import { Repository } from 'typeorm';
import { StaffAvailability } from './entities/staff-availability.entity';
import { User } from '../users/entities/user.entity';
export declare class StaffAvailabilityService {
    private availRepo;
    private userRepo;
    constructor(availRepo: Repository<StaffAvailability>, userRepo: Repository<User>);
    getAvailableStaff(departmentId: string, cityId: string): Promise<StaffAvailability[]>;
    findByStaffId(staffId: string): Promise<StaffAvailability>;
    incrementLoad(staffId: string): Promise<void>;
    decrementLoad(staffId: string): Promise<void>;
    toggleAvailability(staffId: string): Promise<StaffAvailability>;
    syncFromDatabase(staffId: string): Promise<void>;
}
