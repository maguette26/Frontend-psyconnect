import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-psyconnect.up.railway.app/api',
  withCredentials: false,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const PUBLIC_ROUTES = ['/professionnels/inscription', '/auth/login', '/auth/register'];

// ─── Intercepteur de requête (UNIQUE — attache le token si dispo) ─────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isPublic = PUBLIC_ROUTES.some(route => config.url?.includes(route));

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Intercepteur de réponse : met à jour currentUserInfo SANS écraser le token ──
api.interceptors.response.use((response) => {
  if (response.config.url?.includes('/auth/me')) {
    try {
      const previous = JSON.parse(localStorage.getItem('currentUserInfo') || '{}');
      // On fusionne : les infos fraîches de /auth/me complètent l'objet existant
      // sans supprimer le champ token stocké lors du login.
      const merged = { ...previous, ...response.data };
      localStorage.setItem('currentUserInfo', JSON.stringify(merged));
      if (response.data.role) {
        localStorage.setItem('role', response.data.role);
      }
    } catch {
      localStorage.setItem('currentUserInfo', JSON.stringify(response.data));
    }
  }
  return response;
});

// ─── Intercepteur de réponse : gestion des erreurs 401 + retry réseau ────────
const MAX_RETRIES = 3;
const BASE_DELAY = 1500; // ms

const isRetryable = (error) => {
  if (!error.response) return true; // réseau / timeout
  const status = error.response.status;
  return [502, 503, 504].includes(status);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUserInfo');
      return Promise.reject(error);
    }

    if (config && isRetryable(error)) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        await delay(BASE_DELAY * config.__retryCount);
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export const getConsultations = () => api.get('/consultations').then(r => r.data);
export const getConsultation = (id) => api.get(`/consultations/${id}`).then(r => r.data);
export const getChatHistory = (id) =>
  api.get(`/chat/${id}/history`).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);
export const logout = () => api.post('/auth/logout');

export default api;