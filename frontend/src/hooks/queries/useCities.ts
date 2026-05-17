import { useQuery } from '@tanstack/react-query';
import { citiesApi } from '@/api/endpoints/cities.api';

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: citiesApi.findAll,
    staleTime: Infinity,
  });
}
