import { ComplaintPriority } from '../../../common/enums/complaint-priority.enum';
import { ComplaintStatus } from '../../../common/enums/complaint-status.enum';
export declare class ComplaintQueryDto {
    status?: ComplaintStatus;
    cityId?: string;
    departmentId?: string;
    staffId?: string;
    priority?: ComplaintPriority;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
