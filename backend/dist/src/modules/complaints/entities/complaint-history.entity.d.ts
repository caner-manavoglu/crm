import { ComplaintStatus } from '../../../common/enums/complaint-status.enum';
import { User } from '../../users/entities/user.entity';
export declare class ComplaintHistory {
    id: string;
    complaint: any;
    complaintId: string;
    user: User;
    userId: string;
    oldStatus: ComplaintStatus;
    newStatus: ComplaintStatus;
    notes: string;
    createdAt: Date;
}
