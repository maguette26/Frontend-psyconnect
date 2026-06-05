// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-psyconnect.up.railway.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs 401 (session expirée)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn("Session expirée, redirection vers la connexion...");
      localStorage.removeItem('role');
      // window.location.href = '/login'; // Décommenter si redirection souhaitée
    }
    return Promise.reject(error);
  }
);

// --- Méthodes métier ---

export const getConsultations = () =>
  api.get('/consultations').then(res => res.data);

export const getConsultation = (id) =>
  api.get(`/consultations/${id}`).then(res => res.data);

export const getChatHistory = (consultationId) =>
  api.get(`/chat/${consultationId}/history`).then(res => res.data);

export const login = (username, password) =>
  api.post('/auth/login',
    new URLSearchParams({ username, password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  ).then(res => res.data);

export const logout = () =>
  api.post('/auth/logout');

export const getMe = () =>
  api.get('/auth/me').then(res => res.data);

export default api;