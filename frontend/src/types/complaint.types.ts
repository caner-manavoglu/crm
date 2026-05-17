export type ComplaintStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high';

export interface Complaint {
  id: string;
  title: string;
  content: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  customerId: string;
  categoryId: string;
  cityId: string;
  category?: { id: string; name: string; departmentId: string; department: { id: string; name: string } };
  city?: { id: string; name: string };
  customer?: { id: string; name: string; surname: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintHistory {
  id: string;
  complaintId: string;
  userId?: string;
  oldStatus?: ComplaintStatus;
  newStatus: ComplaintStatus;
  notes?: string;
  createdAt: string;
  user?: { id: string; name: string; surname: string };
}

export interface Assignment {
  id: string;
  complaintId: string;
  staffId: string;
  assignedById?: string;
  assignmentType: 'auto' | 'manual' | 'transfer';
  notes?: string;
  isActive: boolean;
  assignedAt: string;
  complaint?: Complaint;
  staff?: { id: string; name: string; surname: string };
}

export interface StaffAvailability {
  id: string;
  staffId: string;
  currentLoad: number;
  maxCapacity: number;
  isAvailable: boolean;
  lastUpdated: string;
  staff?: { id: string; name: string; surname: string; departmentId: string; cityId: string };
}
