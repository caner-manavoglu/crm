import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attachmentsApi } from '@/api/endpoints/attachments.api';

export const attachmentKeys = {
  all: ['attachments'] as const,
  byComplaint: (id: string) => [...attachmentKeys.all, 'complaint', id] as const,
  byTracking: (code: string) => [...attachmentKeys.all, 'track', code] as const,
};

export function useAttachments(complaintId: string) {
  return useQuery({
    queryKey: attachmentKeys.byComplaint(complaintId),
    queryFn: () => attachmentsApi.list(complaintId),
    enabled: !!complaintId,
  });
}

export function useUploadAttachment(complaintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentsApi.upload(complaintId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attachmentKeys.byComplaint(complaintId) });
    },
  });
}

export function useDeleteAttachment(complaintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attachmentsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attachmentKeys.byComplaint(complaintId) });
    },
  });
}

export function useTrackAttachments(code: string) {
  return useQuery({
    queryKey: attachmentKeys.byTracking(code),
    queryFn: () => attachmentsApi.trackList(code),
    enabled: !!code,
  });
}

export function useTrackUploadAttachment(code: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentsApi.trackUpload(code, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attachmentKeys.byTracking(code) });
    },
  });
}
