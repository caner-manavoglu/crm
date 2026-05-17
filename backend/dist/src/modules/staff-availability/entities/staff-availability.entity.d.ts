import { User } from '../../users/entities/user.entity';
export declare class StaffAvailability {
    id: string;
    staff: User;
    staffId: string;
    currentLoad: number;
    maxCapacity: number;
    isAvailable: boolean;
    lastUpdated: Date;
}
