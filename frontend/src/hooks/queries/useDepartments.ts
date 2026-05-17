import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '@/api/endpoints/departments.api';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.findAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; description: string; isActive: boolean }> }) =>
      departmentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: departmentsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
}
