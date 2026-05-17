import { Repository } from 'typeorm';
import { Complaint } from '../complaints/entities/complaint.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';
export declare class AnalyticsService {
    private complaintRepo;
    private assignmentRepo;
    private availRepo;
    constructor(complaintRepo: Repository<Complaint>, assignmentRepo: Repository<Assignment>, availRepo: Repository<StaffAvailability>);
    getDashboardStats(): Promise<{
        total: number;
        pending: number;
        assigned: number;
        inProgress: number;
        resolved: number;
        closed: number;
        totalStaff: number;
        availableStaff: number;
    }>;
    getComplaintsByStatus(): Promise<any[]>;
    getComplaintsByDepartment(): Promise<any[]>;
    getResolutionTrend(days?: number): Promise<any[]>;
    getStaffPerformance(): Promise<any[]>;
}
