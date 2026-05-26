import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { complaintsApi } from '@/api/endpoints/complaints.api';

export const complaintKeys = {
  all: ['complaints'] as const,
  lists: () => [...complaintKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...complaintKeys.lists(), params] as const,
  mine: (params?: Record<string, unknown>) => [...complaintKeys.all, 'mine', params] as const,
  detail: (id: string) => [...complaintKeys.all, 'detail', id] as const,
  history: (id: string) => [...complaintKeys.all, 'history', id] as const,
};

export function useAllComplaints(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: complaintKeys.list(params ?? {}),
    queryFn: () => complaintsApi.findAll(params),
  });
}

export function useMyComplaints(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: complaintKeys.mine(params),
    queryFn: () => complaintsApi.findMine(params),
  });
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: complaintKeys.detail(id),
    queryFn: () => complaintsApi.findOne(id),
    enabled: !!id,
  });
}

export function useComplaintHistory(id: string) {
  return useQuery({
    queryKey: complaintKeys.history(id),
    queryFn: () => complaintsApi.getHistory(id),
    enabled: !!id,
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: complaintsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}

export function useUpdateComplaintStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      complaintsApi.updateStatus(id, status, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}

export function useUpdateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title?: string; content?: string; priority?: string; categoryId?: string; cityId?: string };
    }) => complaintsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}

export function useDeleteComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => complaintsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}
