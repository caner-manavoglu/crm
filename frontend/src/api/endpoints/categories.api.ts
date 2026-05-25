import api from '../axios';

export const categoriesApi = {
  findAll: (departmentId?: string) =>
    api.get('/api/categories', { params: departmentId ? { departmentId } : {} }).then((r) => r.data.data),
  create: (data: { name: string; departmentId: string; description?: string }) =>
    api.post('/api/categories', data).then((r) => r.data.data),
  update: (id: string, data: Partial<{ name: string; departmentId: string; description: string; isActive: boolean }>) =>
    api.patch(`/api/categories/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/api/categories/${id}`),
};
