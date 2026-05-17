import { StaffAvailabilityService } from './staff-availability.service';
import { User } from '../users/entities/user.entity';
export declare class StaffAvailabilityController {
    private service;
    constructor(service: StaffAvailabilityService);
    getAvailableStaff(departmentId: string, cityId: string): Promise<import("./entities/staff-availability.entity").StaffAvailability[]>;
    toggleAvailability(user: User): Promise<import("./entities/staff-availability.entity").StaffAvailability>;
    getMyAvailability(user: User): Promise<import("./entities/staff-availability.entity").StaffAvailability>;
}
