import { api } from '../../lib/api';

export const followUpsApi = {
  list: (params) => api.get('/follow-ups', params).then((r) => r.data),
  update: (id, body) => api.patch(`/follow-ups/${id}`, body).then((r) => r.data),
};
