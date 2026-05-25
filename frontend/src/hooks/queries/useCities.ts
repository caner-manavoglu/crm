import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { citiesApi } from '@/api/endpoints/cities.api';

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: citiesApi.findAll,
    staleTime: Infinity,
  });
}

export function useCreateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: citiesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cities'] }),
  });
}

export function useUpdateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; code: string; isActive: boolean }> }) =>
      citiesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cities'] }),
  });
}

export function useDeleteCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: citiesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cities'] }),
  });
}
