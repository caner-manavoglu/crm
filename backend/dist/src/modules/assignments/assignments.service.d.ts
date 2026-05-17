import { DataSource, Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { ComplaintHistory } from '../complaints/entities/complaint-history.entity';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';
import { Category } from '../categories/entities/category.entity';
import { AssignmentType } from '../../common/enums/assignment-type.enum';
import { CreateComplaintDto } from '../complaints/dto/create-complaint.dto';
import { TransferAssignmentDto } from './dto/transfer-assignment.dto';
export declare class AssignmentsService {
    private assignmentRepo;
    private complaintRepo;
    private historyRepo;
    private availRepo;
    private categoryRepo;
    private dataSource;
    constructor(assignmentRepo: Repository<Assignment>, complaintRepo: Repository<Complaint>, historyRepo: Repository<ComplaintHistory>, availRepo: Repository<StaffAvailability>, categoryRepo: Repository<Category>, dataSource: DataSource);
    handleNewComplaint(complaint: Complaint, dto: CreateComplaintDto): Promise<Assignment | null>;
    findMostAvailableStaff(departmentId: string, cityId: string): Promise<StaffAvailability | null>;
    assignComplaint(complaintId: string, staffId: string, type: AssignmentType, assignedById?: string): Promise<Assignment>;
    transferAssignment(assignmentId: string, dto: TransferAssignmentDto, requesterId: string): Promise<Assignment>;
    getMyAssignments(staffId: string): Promise<Assignment[]>;
    findByComplaintId(complaintId: string): Promise<Assignment | null>;
    processPool(): Promise<{
        assigned: number;
        stillPending: number;
    }>;
    adminAssign(complaintId: string, staffId: string, adminId: string): Promise<Assignment>;
}
