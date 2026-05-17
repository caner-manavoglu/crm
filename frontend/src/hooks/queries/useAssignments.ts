import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '@/api/endpoints/assignments.api';
import { complaintKeys } from './useComplaints';

const assignmentKeys = {
  mine: ['assignments', 'mine'] as const,
  byComplaint: (id: string) => ['assignments', 'complaint', id] as const,
};

export function useMyAssignments() {
  return useQuery({
    queryKey: assignmentKeys.mine,
    queryFn: assignmentsApi.getMyAssignments,
  });
}

export function useAssignmentByComplaint(complaintId: string) {
  return useQuery({
    queryKey: assignmentKeys.byComplaint(complaintId),
    queryFn: () => assignmentsApi.findByComplaint(complaintId),
    enabled: !!complaintId,
  });
}

export function useTransferComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, toStaffId, reason }: { id: string; toStaffId: string; reason?: string }) =>
      assignmentsApi.transfer(id, toStaffId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assignmentKeys.mine });
      qc.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}

export function useAdminAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ complaintId, staffId }: { complaintId: string; staffId: string }) =>
      assignmentsApi.adminAssign(complaintId, staffId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}
