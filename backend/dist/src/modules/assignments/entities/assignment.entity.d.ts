import { AssignmentType } from '../../../common/enums/assignment-type.enum';
import { Complaint } from '../../complaints/entities/complaint.entity';
import { User } from '../../users/entities/user.entity';
export declare class Assignment {
    id: string;
    complaint: Complaint;
    complaintId: string;
    staff: User;
    staffId: string;
    assignedBy: User;
    assignedById: string;
    assignmentType: AssignmentType;
    notes: string | null;
    isActive: boolean;
    assignedAt: Date;
}
