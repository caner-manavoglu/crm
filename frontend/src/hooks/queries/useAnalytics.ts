import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/endpoints/analytics.api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboard,
    refetchInterval: 1000 * 60,
  });
}

export function useStatusBreakdown() {
  return useQuery({
    queryKey: ['analytics', 'status'],
    queryFn: analyticsApi.getStatusBreakdown,
  });
}

export function useDepartmentBreakdown() {
  return useQuery({
    queryKey: ['analytics', 'department'],
    queryFn: analyticsApi.getDepartmentBreakdown,
  });
}

export function useResolutionTrend(days?: number) {
  return useQuery({
    queryKey: ['analytics', 'trend', days],
    queryFn: () => analyticsApi.getTrend(days),
  });
}

export function useStaffPerformance() {
  return useQuery({
    queryKey: ['analytics', 'staff-performance'],
    queryFn: analyticsApi.getStaffPerformance,
  });
}
