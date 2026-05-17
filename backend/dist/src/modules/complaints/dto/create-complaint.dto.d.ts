import { ComplaintPriority } from '../../../common/enums/complaint-priority.enum';
export declare class CreateComplaintDto {
    title: string;
    content: string;
    categoryId: string;
    cityId: string;
    priority?: ComplaintPriority;
    autoAssign: boolean;
    preferredStaffId?: string;
}
