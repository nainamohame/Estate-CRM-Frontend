import { api } from '../../lib/api';

export const bookingsApi = {
  list: (params) => api.get('/bookings', params),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  create: (body) => api.post('/bookings', body).then((r) => r.data),
  confirm: (id) => api.patch(`/bookings/${id}/confirm`).then((r) => r.data),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }).then((r) => r.data),
};
