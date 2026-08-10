import { apiClient } from './axios.js';

export const ticketApi = {
  list: (params) => apiClient.get('/tickets', { params }),

  myTickets: (employeeId) =>
    apiClient.get('/tickets/my', {
      params: { employeeId }
    }),

  myRoleTickets: (employeeId) =>
    apiClient.get('/tickets/my', {
      params: { employeeId }
    }),
  create: (payload) => apiClient.post('/tickets', payload),
  update: (id, payload) => apiClient.put(`/tickets/${id}`, payload),
  approve: (id, payload) => apiClient.put(`/tickets/${id}/approve`, payload),
  reject: (id, payload) => apiClient.put(`/tickets/${id}/reject`, payload),
  updateStatus: (id, payload) => apiClient.put(`/tickets/${id}/status`, payload),

  // ADD THIS
  getHistory: (ticketId) =>
    apiClient.get(`/ticket-history/${ticketId}`),

  listByEmployee: (employeeId) =>
    apiClient.get(`/tickets/employee/${employeeId}`),

  uploadAttachments: (id, formData) =>
    apiClient.post(`/tickets/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};