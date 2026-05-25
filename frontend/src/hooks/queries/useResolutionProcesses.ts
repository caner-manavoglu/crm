import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resolutionProcessesApi } from '@/api/endpoints/resolution-processes.api';
import type { ResolutionProcessInput, ResolutionStepInput } from '@/types/resolution.types';

const keys = {
  all: ['resolution-processes'] as const,
  list: (params?: { categoryId?: string; cityId?: string }) =>
    [...keys.all, 'list', params ?? {}] as const,
  complaintSteps: (complaintId: string) => ['complaint-steps', complaintId] as const,
};

export function useResolutionProcesses(params?: { categoryId?: string; cityId?: string }) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => resolutionProcessesApi.findAll(params),
  });
}

export function useCreateResolutionProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ResolutionProcessInput) => resolutionProcessesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateResolutionProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ResolutionProcessInput> }) =>
      resolutionProcessesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteResolutionProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolutionProcessesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

// ---- Talep adımları ----

export function useComplaintSteps(complaintId: string) {
  return useQuery({
    queryKey: keys.complaintSteps(complaintId),
    queryFn: () => resolutionProcessesApi.getComplaintSteps(complaintId),
    enabled: !!complaintId,
  });
}

export function useCompleteStep(complaintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, isCompleted }: { stepId: string; isCompleted: boolean }) =>
      resolutionProcessesApi.completeStep(complaintId, stepId, isCompleted),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.complaintSteps(complaintId) }),
  });
}

export function useCreateComplaintProcess(complaintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; steps: ResolutionStepInput[] }) =>
      resolutionProcessesApi.createForComplaint(complaintId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.complaintSteps(complaintId) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
