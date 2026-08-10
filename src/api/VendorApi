import { apiClient } from './axios';

export const vendorApi = {
  getAll: () => apiClient.get('/vendors'),

  create: (data) => apiClient.post('/vendors', data),

  update: (id, data) => apiClient.put(`/vendors/${id}`, data),

  delete: (id) => apiClient.delete(`/vendors/${id}`)
};