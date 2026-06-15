import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-psyconnect.up.railway.app/api',
  withCredentials: false,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Démarre après 5s pour ne pas bloquer le rendu initial
setTimeout(() => {
  const keepAlive = () => {
    fetch('https://backend-psyconnect.up.railway.app/api/ping')
      .catch(() => {});
  };
  keepAlive();
  setInterval(keepAlive, 5 * 60 * 1000);
}, 5000);

api.interceptors.request.use(config => {
  const PUBLIC_ROUTES = ['/professionnels/inscription', '/auth/login', '/auth/register'];
  const isPublic = PUBLIC_ROUTES.some(route => config.url?.includes(route));
  if (!isPublic) {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(async (response) => {
  if (response.config.url?.includes("/auth/me")) {
    localStorage.setItem("currentUserInfo", JSON.stringify(response.data));
    localStorage.setItem("role", response.data.role);
  }
  return response;
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
 
const MAX_RETRIES  = 3;
const BASE_DELAY   = 1500; // ms
 
const isRetryable = (error) => {
  if (!error.response) return true; // réseau / timeout
  const status = error.response.status;
  return [502, 503, 504].includes(status);
};
 
 api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  console.log("➡️ API CALL:", config.url);
  console.log("🔐 TOKEN:", token);

  const PUBLIC_ROUTES = ['/professionnels/inscription', '/auth/login', '/auth/register'];
  const isPublic = PUBLIC_ROUTES.some(route => config.url?.includes(route));

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
export const getConsultations = () => api.get('/consultations').then(r => r.data);
export const getConsultation = (id) => api.get(`/consultations/${id}`).then(r => r.data);
export const getChatHistory = (id) =>
  api.get(`/chat/${id}/history`).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);
export const logout = () => api.post('/auth/logout');

export default api;