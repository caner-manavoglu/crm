import api from '../axios';
import type { ResolutionProcessInput, ResolutionStepInput } from '@/types/resolution.types';

export const resolutionProcessesApi = {
  findAll: (params?: { categoryId?: string; cityId?: string }) =>
    api.get('/api/resolution-processes', { params }).then((r) => r.data.data),

  findOne: (id: string) =>
    api.get(`/api/resolution-processes/${id}`).then((r) => r.data.data),

  findApplicable: (categoryId: string, cityId: string) =>
    api
      .get('/api/resolution-processes/applicable', { params: { categoryId, cityId } })
      .then((r) => r.data.data),

  create: (data: ResolutionProcessInput) =>
    api.post('/api/resolution-processes', data).then((r) => r.data.data),

  update: (id: string, data: Partial<ResolutionProcessInput>) =>
    api.patch(`/api/resolution-processes/${id}`, data).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/api/resolution-processes/${id}`),

  // Talep adımları
  getComplaintSteps: (complaintId: string) =>
    api
      .get(`/api/resolution-processes/complaint/${complaintId}/steps`)
      .then((r) => r.data.data),

  completeStep: (complaintId: string, stepId: string, isCompleted: boolean) =>
    api
      .patch(`/api/resolution-processes/complaint/${complaintId}/steps/${stepId}`, { isCompleted })
      .then((r) => r.data.data),

  createForComplaint: (
    complaintId: string,
    data: { name: string; steps: ResolutionStepInput[] },
  ) =>
    api
      .post(`/api/resolution-processes/complaint/${complaintId}`, data)
      .then((r) => r.data.data),
};
