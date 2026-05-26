import api from '../axios';

export type ComplaintMessage = {
  id: string;
  complaintId: string;
  body: string;
  isInternal: boolean;
  sender?: {
    id: string;
    name: string;
    surname: string;
    role: 'admin' | 'staff' | 'customer';
  } | null;
  createdAt: string;
};

export const messagesApi = {
  list: (complaintId: string) =>
    api.get<{ data: ComplaintMessage[] }>(`/api/complaints/${complaintId}/messages`).then((r) => r.data.data),

  create: (complaintId: string, body: string, isInternal?: boolean) =>
    api
      .post<{ data: ComplaintMessage }>(`/api/complaints/${complaintId}/messages`, {
        body,
        ...(isInternal !== undefined ? { isInternal } : {}),
      })
      .then((r) => r.data.data),
};
