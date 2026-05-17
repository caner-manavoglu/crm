import api from '../axios';

export const assignmentsApi = {
  getMyAssignments: () => api.get('/api/assignments/my').then((r) => r.data.data),

  adminAssign: (complaintId: string, staffId: string) =>
    api.post('/api/assignments/admin-assign', { complaintId, staffId }).then((r) => r.data.data),

  transfer: (assignmentId: string, toStaffId: string, reason?: string) =>
    api.patch(`/api/assignments/${assignmentId}/transfer`, { toStaffId, reason }).then((r) => r.data.data),

  findByComplaint: (complaintId: string) =>
    api.get(`/api/assignments/complaint/${complaintId}`).then((r) => r.data.data),
};
