import { apiClient } from './axios.js';
 
export const assignedAssetApi = {
 
  // Active Assigned Assets
  list: () => apiClient.get('/assigned-assets'),
 
  // Assigned Asset History
  history: () => apiClient.get('/assigned-asset-history'),
 
  // Assign Asset
  create: (payload) => apiClient.post('/assigned-assets', payload),
 
  // Update Assignment
  update: (id, payload) => apiClient.put(`/assigned-assets/${id}`, payload),
 
  // Delete Active Assignment
  remove: (id) => apiClient.delete(`/assigned-assets/${id}`),

  // Admin dashboard: all assets assigned within a project
  byProject: (project) => apiClient.get(`/assigned-assets/project/${encodeURIComponent(project)}`),

  // Employee dashboard: all assets assigned to a single employee
  byEmployee: (employeeId) => apiClient.get(`/assigned-assets/employee/${encodeURIComponent(employeeId)}`),
  moveToHistory: (id, payload) =>
  apiClient.post(
    `/assigned-asset-history/move/${id}`,
    null,
    {
      params: {
        currentStatus: payload.currentStatus,
        reason: payload.reason,
        updatedBy: payload.updatedBy
      }
    }
  )
};
 