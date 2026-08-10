import { api } from './client.js';
import { assetApi } from './assetApi.js';
import { ticketApi } from './ticketApi.js';
import { reportApi } from './reportApi.js';
import { technicalIssueApi } from './technicalIssueApi.js';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me')
};


export const dashboardApi = {
  getSuperAdminDashboard: () => api.get('/dashboard/super-admin')
};

export const usersApi = {
  list: (params) => api.get('/users', { params }),
  create: (payload) => api.post('/users', payload),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  remove: (id) => api.delete(`/users/${id}`),

    // ADD THIS
  getProjectApprovalRoles: (project) =>
    api.get(`/users/project/${project}/approval-roles`)
};

export const assetsApi = assetApi;
export const ticketsApi = ticketApi;
export const reportsApi = reportApi;
export const technicalIssuesApi = technicalIssueApi;
export const notificationsApi = {
  list: () => api.get("/notifications"),

  listByRole: (role) =>
    api.get(`/notifications/role/${role}`),

  markAsRead: (id) =>
    api.put(`/notifications/${id}/read`),

 markAllRead: (role) =>
    api.put(`/notifications/read-all/${role}`),

  remove: (id) =>
    api.delete(`/notifications/${id}`)
};