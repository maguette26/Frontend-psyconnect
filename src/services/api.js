// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-psyconnect.up.railway.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn("Session expirée, redirection vers la connexion...");
      localStorage.removeItem('role');
    }
    return Promise.reject(error);
  }
);

// ✅ Login en JSON (compatible avec JsonUsernamePasswordAuthenticationFilter)
export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then(res => res.data);

export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me').then(res => res.data);
export const getConsultations = () => api.get('/consultations').then(res => res.data);
export const getConsultation = (id) => api.get(`/consultations/${id}`).then(res => res.data);
export const getChatHistory = (id) => api.get(`/chat/${id}/history`).then(res => res.data);

export default api;