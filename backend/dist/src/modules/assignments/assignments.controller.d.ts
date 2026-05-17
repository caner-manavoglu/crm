import { AssignmentsService } from './assignments.service';
import { TransferAssignmentDto } from './dto/transfer-assignment.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { User } from '../users/entities/user.entity';
export declare class AssignmentsController {
    private assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    getMyAssignments(user: User): Promise<import("./entities/assignment.entity").Assignment[]>;
    adminAssign(dto: CreateAssignmentDto, user: User): Promise<import("./entities/assignment.entity").Assignment>;
    transfer(id: string, dto: TransferAssignmentDto, user: User): Promise<import("./entities/assignment.entity").Assignment>;
    findByComplaint(complaintId: string): Promise<import("./entities/assignment.entity").Assignment | null>;
}
