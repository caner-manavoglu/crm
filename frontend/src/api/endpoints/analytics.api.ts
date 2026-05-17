import api from '../axios';

export const analyticsApi = {
  getDashboard: () => api.get('/api/analytics/dashboard').then((r) => r.data.data),
  getStatusBreakdown: () => api.get('/api/analytics/status-breakdown').then((r) => r.data.data),
  getDepartmentBreakdown: () => api.get('/api/analytics/department-breakdown').then((r) => r.data.data),
  getTrend: (days?: number) =>
    api.get('/api/analytics/trend', { params: days ? { days } : {} }).then((r) => r.data.data),
  getStaffPerformance: () => api.get('/api/analytics/staff-performance').then((r) => r.data.data),
};
