import { api } from '../../lib/api';

export const leadsApi = {
  list: (params) => api.get('/leads', params),
  board: (params) => api.get('/leads/board', params).then((r) => r.data),
  get: (id) => api.get(`/leads/${id}`).then((r) => r.data),
  create: (body) => api.post('/leads', body).then((r) => r.data),
  update: (id, body) => api.patch(`/leads/${id}`, body).then((r) => r.data),
  changeStage: (id, body) => api.patch(`/leads/${id}/stage`, body).then((r) => r.data),
  remove: (id) => api.del(`/leads/${id}`),
  activities: (id) => api.get(`/leads/${id}/activities`).then((r) => r.data),
  addActivity: (id, body) => api.post(`/leads/${id}/activities`, body).then((r) => r.data),
  followUps: (id) => api.get(`/leads/${id}/follow-ups`).then((r) => r.data),
  createFollowUp: (id, body) => api.post(`/leads/${id}/follow-ups`, body).then((r) => r.data),
};
