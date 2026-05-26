import api from '../axios';

export const complaintsApi = {
  create: (data: {
    customerName: string;
    customerSurname: string;
    customerEmail: string;
    customerPhone?: string;
    title: string;
    content: string;
    categoryId: string;
    cityId: string;
    priority?: string;
    autoAssign: boolean;
    preferredStaffId?: string;
  }) => api.post('/api/complaints', data).then((r) => r.data.data),

  findAll: (params?: Record<string, unknown>) =>
    api.get('/api/complaints', { params }).then((r) => r.data),

  findMine: (params?: Record<string, unknown>) =>
    api.get('/api/complaints/my', { params }).then((r) => r.data),

  findOne: (id: string) => api.get(`/api/complaints/${id}`).then((r) => r.data.data),

  getHistory: (id: string) => api.get(`/api/complaints/${id}/history`).then((r) => r.data.data),

  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/api/complaints/${id}/status`, { status, notes }).then((r) => r.data.data),

  update: (
    id: string,
    data: {
      title?: string;
      content?: string;
      priority?: string;
      categoryId?: string;
      cityId?: string;
    },
  ) => api.patch(`/api/complaints/${id}`, data).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/api/complaints/${id}`).then((r) => r.data),

  trackByCode: (code: string) =>
    api.get(`/api/complaints/track/${encodeURIComponent(code)}`).then((r) => r.data.data),
};
