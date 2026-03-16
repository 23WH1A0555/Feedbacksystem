import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.message || 'Something went wrong';
    const errors = err.response?.data?.errors || [];
    return Promise.reject({ message, errors, status: err.response?.status });
  }
);

export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getAll: (params) => api.get('/feedback', { params }),
  getById: (id) => api.get(`/feedback/${id}`),
  updateStatus: (id, status) => api.put(`/feedback/${id}/status`, { status }),
  delete: (id) => api.delete(`/feedback/${id}`),
};

export const statsAPI = {
  get: () => api.get('/stats'),
};

export default api;