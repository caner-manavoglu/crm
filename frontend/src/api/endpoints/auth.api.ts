import api from '../axios';

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }).then((r) => r.data.data),

  register: (data: { email: string; password: string; name: string; surname: string }) =>
    api.post('/api/auth/register', data).then((r) => r.data.data),

  me: () => api.get('/api/auth/me').then((r) => r.data.data),
};
