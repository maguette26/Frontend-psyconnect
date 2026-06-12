/**
 * useServerWakeUp — hook pour gérer le cold start Railway
 *
 * Utilisation :
 *   const { isWaking, apiCall } = useServerWakeUp();
 *   const data = await apiCall(() => api.get('/mon-endpoint'));
 */
import { useState, useCallback } from 'react';
import api from '../services/api';

const MAX_RETRIES  = 5;
const BASE_DELAY   = 2500;
const HEALTH_ROUTE = '/actuator/health'; // adapte à ton backend

export function useServerWakeUp() {
  const [isWaking, setIsWaking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const apiCall = useCallback(async (fn) => {
    let wakeTimer = setTimeout(() => setIsWaking(true), 1500);

    try {
      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          const result = await fn();
          setIsOnline(true);
          return result;
        } catch (err) {
          const shouldRetry =
            !err?.response ||
            err?.response?.status === 502 ||
            err?.response?.status === 503;

          if (shouldRetry && i < MAX_RETRIES - 1) {
            setIsWaking(true);
            try { await api.get(HEALTH_ROUTE); } catch (_) {}
            await new Promise(r => setTimeout(r, BASE_DELAY * (i + 1)));
          } else {
            if (shouldRetry) setIsOnline(false);
            throw err;
          }
        }
      }
    } finally {
      clearTimeout(wakeTimer);
      setIsWaking(false);
    }
  }, []);

  return { isWaking, isOnline, apiCall };
}