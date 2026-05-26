import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/api/endpoints/messages.api';

export const messageKeys = {
  all: ['messages'] as const,
  thread: (complaintId: string) => [...messageKeys.all, complaintId] as const,
};

export function useMessages(complaintId: string) {
  return useQuery({
    queryKey: messageKeys.thread(complaintId),
    queryFn: () => messagesApi.list(complaintId),
    enabled: !!complaintId,
  });
}

export function usePostMessage(complaintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, isInternal }: { body: string; isInternal?: boolean }) =>
      messagesApi.create(complaintId, body, isInternal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messageKeys.thread(complaintId) });
    },
  });
}
