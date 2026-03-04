import axios from 'axios';

const API_BASE_URL = 'https://roimerger-production.up.railway.app';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

const api = {
  getDashboardSummary: async () => {
    try {
      console.log('Fetching summary from:', API_BASE_URL + '/api/dashboard/summary');
      const response = await apiClient.get('/api/dashboard/summary');
      return response.data;
    } catch (error) {
      console.error('FETCH ERROR (Summary):', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getFirms: async (limit = null) => {
    const params = limit ? { limit } : {};
    const response = await apiClient.get('/api/firms', { params });
    return response.data;
  },

  searchFirms: async (query) => {
    const response = await apiClient.get('/api/firms', { params: { name: query } });
    return response.data;
  },

  getROI: async (firmId = null) => {
    const params = firmId ? { firm_id: firmId } : {};
    const response = await apiClient.get('/api/roi', { params });
    return response.data;
  },

  getCapitalProductivity: async (firmId = null) => {
    const params = firmId ? { firm_id: firmId } : {};
    const response = await apiClient.get('/api/capital/productivity', { params });
    return response.data;
  },

  getBottlenecks: async () => {
    const response = await apiClient.get('/api/bottlenecks');
    return response.data;
  },

  getResourceRecommendations: async () => {
    const response = await apiClient.get('/api/resources/recommendations');
    return response.data;
  },

  analyzeMerger: async (firmAId, firmBId) => {
    const response = await apiClient.post('/api/merger/analyze', null, {
      params: { firm_a_id: firmAId, firm_b_id: firmBId }
    });
    return response.data;
  },
};

export default api;
