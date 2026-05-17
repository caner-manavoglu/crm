import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffAvailabilityApi } from '@/api/endpoints/staff-availability.api';

export function useAvailableStaff(departmentId?: string, cityId?: string) {
  return useQuery({
    queryKey: ['staff-availability', departmentId, cityId],
    queryFn: () => staffAvailabilityApi.getAvailableStaff(departmentId!, cityId!),
    enabled: !!departmentId && !!cityId,
    staleTime: 1000 * 30,
  });
}

export function useMyAvailability() {
  return useQuery({
    queryKey: ['staff-availability', 'me'],
    queryFn: staffAvailabilityApi.getMyAvailability,
  });
}

export function useToggleAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: staffAvailabilityApi.toggleAvailability,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-availability', 'me'] }),
  });
}
