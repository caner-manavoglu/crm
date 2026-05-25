import api from '../axios';

export const citiesApi = {
  findAll: () => api.get('/api/cities').then((r) => r.data.data),
  create: (data: { name: string; code: string }) =>
    api.post('/api/cities', data).then((r) => r.data.data),
  update: (id: string, data: Partial<{ name: string; code: string; isActive: boolean }>) =>
    api.patch(`/api/cities/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/api/cities/${id}`),
};
