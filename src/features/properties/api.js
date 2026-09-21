import { api } from '../../lib/api';

export const propertiesApi = {
  listProjects: () => api.get('/projects').then((r) => r.data),
  getProject: (id) => api.get(`/projects/${id}`).then((r) => r.data),
  createProject: (body) => api.post('/projects', body).then((r) => r.data),
  updateProject: (id, body) => api.patch(`/projects/${id}`, body).then((r) => r.data),

  createBuilding: (body) => api.post('/buildings', body).then((r) => r.data),
  updateBuilding: (id, body) => api.patch(`/buildings/${id}`, body).then((r) => r.data),

  listUnits: (params) => api.get('/units', params),
  getUnit: (id) => api.get(`/units/${id}`).then((r) => r.data),
  createUnit: (body) => api.post('/units', body).then((r) => r.data),
  updateUnit: (id, body) => api.patch(`/units/${id}`, body).then((r) => r.data),
  setListingStatus: (id, listingStatus) => api.patch(`/units/${id}/listing-status`, { listingStatus }).then((r) => r.data),
};
