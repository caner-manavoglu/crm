import { Repository } from 'typeorm';
import { Complaint } from './entities/complaint.entity';
import { ComplaintHistory } from './entities/complaint-history.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { ComplaintQueryDto } from './dto/complaint-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
export declare class ComplaintsService {
    private complaintRepo;
    private historyRepo;
    private userRepo;
    private static readonly GUEST_EMAIL;
    constructor(complaintRepo: Repository<Complaint>, historyRepo: Repository<ComplaintHistory>, userRepo: Repository<User>);
    create(dto: CreateComplaintDto, customerId?: string): Promise<Complaint>;
    findAll(query: ComplaintQueryDto): Promise<PaginatedResult<Complaint>>;
    findByCustomer(customerId: string, query: ComplaintQueryDto): Promise<PaginatedResult<Complaint>>;
    findOne(id: string): Promise<Complaint>;
    updateStatus(id: string, dto: UpdateComplaintStatusDto, userId: string, userRole: UserRole): Promise<Complaint>;
    getHistory(id: string): Promise<ComplaintHistory[]>;
    private buildPaginatedQuery;
    private getOrCreateGuestCustomerId;
}
