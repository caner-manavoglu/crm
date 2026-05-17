import api from '../axios';

export const usersApi = {
  findAll: (role?: string) =>
    api.get('/api/users', { params: role ? { role } : {} }).then((r) => r.data.data),
  findOne: (id: string) => api.get(`/api/users/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    api.post('/api/users', data).then((r) => r.data.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/api/users/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/api/users/${id}`),
};
