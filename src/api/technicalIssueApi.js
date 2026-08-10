import { apiClient } from './axios.js';

export const technicalIssueApi = {

  list: () =>
    apiClient.get('/technical-issues'),


  create: (payload) =>
    apiClient.post('/technical-issues', payload),


  update: (id, payload) =>
    apiClient.put(`/technical-issues/${id}`, payload),


  remove: (id) =>
    apiClient.delete(`/technical-issues/${id}`)
};