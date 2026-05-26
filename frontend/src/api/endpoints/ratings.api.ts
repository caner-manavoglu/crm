import api from '../axios';

export type ComplaintRating = {
  id: string;
  complaintId: string;
  score: number;
  comment: string | null;
  createdAt: string;
};

export type RatingStats = {
  total: number;
  average: number;
  distribution: Record<string, number>;
};

export const ratingsApi = {
  get: (complaintId: string) =>
    api
      .get<{ data: ComplaintRating | null }>(`/api/complaints/${complaintId}/rating`)
      .then((r) => r.data.data),

  create: (complaintId: string, score: number, comment?: string) =>
    api
      .post<{ data: ComplaintRating }>(`/api/complaints/${complaintId}/rate`, {
        score,
        ...(comment ? { comment } : {}),
      })
      .then((r) => r.data.data),

  stats: () => api.get<{ data: RatingStats }>('/api/ratings/stats').then((r) => r.data.data),
};
