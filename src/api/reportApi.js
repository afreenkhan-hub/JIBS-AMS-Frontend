import { apiClient } from './axios.js';

export const reportApi = {
  // TODO: Replace mock report rows with GET /api/reports when Spring Boot endpoints are ready.
  list: (params) => apiClient.get('/reports', { params }),
  export: (params) => apiClient.get('/reports/export', { params, responseType: 'blob' })
};
