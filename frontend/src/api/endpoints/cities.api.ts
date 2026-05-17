import api from '../axios';

export const citiesApi = {
  findAll: () => api.get('/api/cities').then((r) => r.data.data),
};
