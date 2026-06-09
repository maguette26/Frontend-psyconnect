// hooks/useBackendWarmup.js

import { useState, useEffect, useRef } from "react";

const MAX_RETRIES = 8;
const BASE_DELAY_MS = 1000;
const HEALTH_URL = "https://backend-psyconnect.up.railway.app/api/health";

export function useBackendWarmup() {
  const [isReady, setIsReady] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(true);
  const attemptRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      if (cancelled) return;

      try {
        const res = await fetch(HEALTH_URL, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          if (!cancelled) {
            setIsReady(true);
            setIsWakingUp(false);
          }
          return;
        }
      } catch (err) {
        // backend en veille → retry
      }

      attemptRef.current += 1;

      if (attemptRef.current >= MAX_RETRIES) {
        if (!cancelled) {
          setIsReady(true);
          setIsWakingUp(false);
        }
        return;
      }

      const delay = Math.min(BASE_DELAY_MS * 2 ** attemptRef.current, 10000);
      setTimeout(ping, delay);
    };

    ping();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isReady, isWakingUp };
}