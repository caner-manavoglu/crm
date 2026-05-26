import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UserListParams } from '@/api/endpoints/users.api';

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: ['users', params ?? {}],
    queryFn: () => usersApi.findAll(params),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      usersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
