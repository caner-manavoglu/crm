import api from '../axios';

export type Attachment = {
  id: string;
  complaintId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById: string | null;
  createdAt: string;
};

export const attachmentsApi = {
  list: (complaintId: string) =>
    api.get<{ data: Attachment[] }>(`/api/complaints/${complaintId}/attachments`).then((r) => r.data.data),

  upload: (complaintId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<{ data: Attachment }>(`/api/complaints/${complaintId}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data);
  },

  remove: (id: string) => api.delete(`/api/attachments/${id}`).then((r) => r.data),

  // Public — takip kodu üzerinden.
  trackList: (code: string) =>
    api
      .get<{ data: Attachment[] }>(`/api/complaints/track/${encodeURIComponent(code)}/attachments`)
      .then((r) => r.data.data),

  trackUpload: (code: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<{ data: Attachment }>(
        `/api/complaints/track/${encodeURIComponent(code)}/attachments`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data.data);
  },

  // Authenticated indirme — axios üzerinden değil, doğrudan URL al.
  downloadUrl: (id: string) => `/api/attachments/${id}`,
  trackDownloadUrl: (code: string, id: string) =>
    `/api/attachments/track/${encodeURIComponent(code)}/${id}`,
};
