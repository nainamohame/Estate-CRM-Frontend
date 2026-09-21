import { api } from '../../lib/api';

export const teamApi = {
  list: () => api.get('/users').then((r) => r.data),
  assignable: () => api.get('/users/assignable').then((r) => r.data),
  create: (body) => api.post('/users', body).then((r) => r.data),
  update: (id, body) => api.patch(`/users/${id}`, body).then((r) => r.data),
  setActive: (id, isActive) => api.patch(`/users/${id}/active`, { isActive }).then((r) => r.data),
};
