import { ComplaintsService } from './complaints.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { ComplaintQueryDto } from './dto/complaint-query.dto';
import { User } from '../users/entities/user.entity';
export declare class ComplaintsController {
    private complaintsService;
    private assignmentsService;
    constructor(complaintsService: ComplaintsService, assignmentsService: AssignmentsService);
    create(dto: CreateComplaintDto, user?: User): Promise<import("./entities/complaint.entity").Complaint>;
    findAll(query: ComplaintQueryDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("./entities/complaint.entity").Complaint>>;
    findMine(user: User, query: ComplaintQueryDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("./entities/complaint.entity").Complaint>>;
    findOne(id: string): Promise<import("./entities/complaint.entity").Complaint>;
    getHistory(id: string): Promise<import("./entities/complaint-history.entity").ComplaintHistory[]>;
    updateStatus(id: string, dto: UpdateComplaintStatusDto, user: User): Promise<import("./entities/complaint.entity").Complaint>;
}
