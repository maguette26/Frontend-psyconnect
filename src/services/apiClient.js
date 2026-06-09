// services/apiClient.js

import axios from "axios";

const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 1500;

const BASE_URL = "https://backend-psyconnect.up.railway.app";

 

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── TOKEN JWT ─────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── RETRY INTELLIGENT RAILWAY ─────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config) return Promise.reject(error);

    const status = error.response?.status;

    // ❌ ne pas retry auth errors
    if (status === 401 || status === 403) {
      return Promise.reject(error);
    }

    config._retryCount = config._retryCount || 0;

    const isNetworkError = !error.response;
    const isServerDown =
      status === 502 || status === 503 || status === 504;

    // 🔁 retry seulement si serveur en veille / down
    if ((isNetworkError || isServerDown) && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;

      const delay = RETRY_DELAY_MS * config._retryCount;

      console.warn(
        `⏳ Retry API (${config.url}) - tentative ${config._retryCount}`
      );

      await new Promise((r) => setTimeout(r, delay));

      return apiClient(config);
    }

    // ❌ après échec : erreur propre
    return Promise.reject({
      message: "SERVICE_UNAVAILABLE",
      original: error,
    });
  }
);

export default apiClient;