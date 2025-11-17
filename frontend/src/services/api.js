/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Auth APIs ====================

export const authAPI = {
  register: async (email, password, fullName) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Save token to localStorage
    localStorage.setItem('access_token', response.data.access_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ==================== Suggestions APIs ====================

export const suggestionsAPI = {
  checkDuplicate: async (title, description) => {
    const response = await api.post('/suggestions/check-duplicate', {
      title,
      description,
    });
    return response.data;
  },

  checkSimilarity: async (title) => {
    const response = await api.post('/suggestions/check-similarity', {
      query: title,
      limit: 5,
    });
    return response.data;
  },

  create: async (title, description) => {
    const response = await api.post('/suggestions', {
      title,
      description,
    });
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/suggestions', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/suggestions/${id}`);
    return response.data;
  },

  toggleVote: async (suggestionId) => {
    const response = await api.post(`/suggestions/${suggestionId}/vote`);
    return response.data;
  },

  upvote: async (suggestionId) => {
    const response = await api.post(`/suggestions/${suggestionId}/vote`, {
      vote_type: 'upvote',
    });
    return response.data;
  },

  downvote: async (suggestionId) => {
    const response = await api.post(`/suggestions/${suggestionId}/vote`, {
      vote_type: 'downvote',
    });
    return response.data;
  },

  removeVote: async (suggestionId) => {
    const response = await api.delete(`/suggestions/${suggestionId}/vote`);
    return response.data;
  },

  search: async (query, limit = 5) => {
    const response = await api.post('/suggestions/search', { query, limit });
    return response.data;
  },

  getMyVotes: async () => {
    const response = await api.get('/suggestions/my/votes');
    return response.data;
  },

  update: async (suggestionId, updates) => {
    const response = await api.put(`/suggestions/${suggestionId}`, updates);
    return response.data;
  },

  delete: async (suggestionId) => {
    const response = await api.delete(`/suggestions/${suggestionId}`);
    return response.data;
  },
};

// ==================== Health Check ====================

export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
