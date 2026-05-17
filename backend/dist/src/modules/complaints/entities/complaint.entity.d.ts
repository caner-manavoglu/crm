import { ComplaintStatus } from '../../../common/enums/complaint-status.enum';
import { ComplaintPriority } from '../../../common/enums/complaint-priority.enum';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { City } from '../../cities/entities/city.entity';
import { ComplaintHistory } from './complaint-history.entity';
export declare class Complaint {
    id: string;
    title: string;
    content: string;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    customer: User;
    customerId: string;
    category: Category;
    categoryId: string;
    city: City;
    cityId: string;
    history: ComplaintHistory[];
    createdAt: Date;
    updatedAt: Date;
}
