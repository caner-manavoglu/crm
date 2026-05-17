import { Repository } from 'typeorm';
import { AssignmentsService } from '../assignments/assignments.service';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';
import { StaffAvailabilityService } from '../staff-availability/staff-availability.service';
export declare class SchedulerService {
    private assignmentsService;
    private availabilityService;
    private availRepo;
    private readonly logger;
    constructor(assignmentsService: AssignmentsService, availabilityService: StaffAvailabilityService, availRepo: Repository<StaffAvailability>);
    handlePoolAssignment(): Promise<void>;
    handleDailySync(): Promise<void>;
}
