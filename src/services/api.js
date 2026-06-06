import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-psyconnect.up.railway.app/api',
  withCredentials: false, // plus besoin avec JWT
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Injecte le token JWT automatiquement
api.interceptors.request.use(config => {
  const PUBLIC_ROUTES = ['/professionnels/inscription', '/auth/login', '/auth/register'];
  const isPublic = PUBLIC_ROUTES.some(route => config.url?.includes(route));

  if (!isPublic) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUserInfo');
    }
    return Promise.reject(error);
  }
);

export const getConsultations = () => api.get('/consultations').then(r => r.data);
export const getConsultation = (id) => api.get(`/consultations/${id}`).then(r => r.data);
export const getChatHistory = (id) => api.get(`/chat/${id}/history`).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);
export const logout = () => api.post('/auth/logout');

export default api;