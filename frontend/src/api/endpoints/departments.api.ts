import api from '../axios';

export const departmentsApi = {
  findAll: () => api.get('/api/departments').then((r) => r.data.data),
  create: (data: { name: string; description?: string }) =>
    api.post('/api/departments', data).then((r) => r.data.data),
  update: (id: string, data: Partial<{ name: string; description: string; isActive: boolean }>) =>
    api.patch(`/api/departments/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/api/departments/${id}`),
};
