import api from '../axios';

export const staffAvailabilityApi = {
  getAvailableStaff: (departmentId: string, cityId: string) =>
    api.get('/api/staff-availability', { params: { departmentId, cityId } }).then((r) => r.data.data),
  toggleAvailability: () =>
    api.patch('/api/staff-availability/toggle').then((r) => r.data.data),
  getMyAvailability: () =>
    api.get('/api/staff-availability/me').then((r) => r.data.data),
};
