import api from '../axios';
import type { User } from '@/types/user.types';

export interface UserListParams {
  role?: string;
  page?: number;
  limit?: number;
  search?: string;
  cityId?: string;
  departmentId?: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = {
  findAll: (params?: UserListParams) =>
    api.get('/api/users', { params }).then((r) => r.data as PaginatedUsersResponse),
  findOne: (id: string) => api.get(`/api/users/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    api.post('/api/users', data).then((r) => r.data.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/api/users/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/api/users/${id}`),
};
