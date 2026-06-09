
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 1500;

/**
 * Wrapper fetch avec retry automatique + backoff exponentiel
 * Remplace fetch() ou axios dans les cas critiques
 *
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} retries
 * @returns {Promise<Response>}
 */
export async function safeFetch(url, options = {}, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Succès : retourner la réponse
      if (response.ok || response.status < 500) {
        return response;
      }

      // Erreur 5xx : retry
      if (attempt < retries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`🔄 Erreur ${response.status}, retry dans ${delay}ms (tentative ${attempt + 1}/${retries})`);
        await sleep(delay);
        continue;
      }

      return response; // on retourne quand même après épuisement des retries
    } catch (err) {
      const isNetworkError = err.name === 'AbortError' || err.name === 'TypeError' || !navigator.onLine;

      if (isNetworkError && attempt < retries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`🔄 Erreur réseau (backend en veille ?), retry dans ${delay}ms (tentative ${attempt + 1}/${retries})`);
        await sleep(delay);
        continue;
      }

      // Épuisé : throw une erreur propre (jamais de message technique brut)
      throw new BackendUnavailableError('Le service est temporairement indisponible. Veuillez patienter...');
    }
  }
}

/**
 * Erreur personnalisée : backend non disponible
 */
export class BackendUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BackendUnavailableError';
    this.isBackendError = true;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper : safeFetch + parse JSON automatique
 */
export async function safeGet(url, options = {}) {
  const res = await safeFetch(url, { method: 'GET', ...options });
  if (!res.ok) throw new BackendUnavailableError(`Erreur ${res.status}`);
  return res.json();
}

export async function safePost(url, body, options = {}) {
  const res = await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...options,
  });
  if (!res.ok) throw new BackendUnavailableError(`Erreur ${res.status}`);
  return res.json();
}