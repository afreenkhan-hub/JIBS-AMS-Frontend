import { apiClient } from './axios.js';

export const assetApi = {

  // Get all assets
  list: (params) =>
    apiClient.get('/assets', { params }),

  // Create single asset
  create: (payload) =>
    apiClient.post('/assets', payload),

  // Update asset
  update: (id, payload) =>
    apiClient.put(`/assets/${id}`, payload),

  // Delete asset
  remove: (id) =>
    apiClient.delete(`/assets/${id}`),

  // Import assets from CSV
  importAssets: (formData) =>
    apiClient.post('/assets/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),

  // Add accessories
  addAccessories: (id, payload) =>
    apiClient.post(
      `/assets/${id}/accessories`,
      payload
    ),

  // Upload document
  uploadDocument: (id, formData) =>
    apiClient.post(
      `/assets/${id}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

};