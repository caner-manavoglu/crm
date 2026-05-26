import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ratingsApi } from '@/api/endpoints/ratings.api';

export const ratingKeys = {
  all: ['ratings'] as const,
  one: (complaintId: string) => [...ratingKeys.all, complaintId] as const,
  stats: () => [...ratingKeys.all, 'stats'] as const,
};

export function useRating(complaintId: string) {
  return useQuery({
    queryKey: ratingKeys.one(complaintId),
    queryFn: () => ratingsApi.get(complaintId),
    enabled: !!complaintId,
  });
}

export function useCreateRating(complaintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ score, comment }: { score: number; comment?: string }) =>
      ratingsApi.create(complaintId, score, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ratingKeys.one(complaintId) });
      qc.invalidateQueries({ queryKey: ratingKeys.stats() });
    },
  });
}

export function useRatingStats() {
  return useQuery({
    queryKey: ratingKeys.stats(),
    queryFn: () => ratingsApi.stats(),
  });
}
