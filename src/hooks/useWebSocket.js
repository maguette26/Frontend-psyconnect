// hooks/useWebSocket.js
import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = "https://backend-psyconnect.up.railway.app/ws-consultation";

export function useWebSocket({ consultationId, onMessage, onOnlineStatus } = {}) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const onMessageRef = useRef(onMessage);
  const onOnlineStatusRef = useRef(onOnlineStatus);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onOnlineStatusRef.current = onOnlineStatus; }, [onOnlineStatus]);

  useEffect(() => {
    if (!consultationId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,

      onConnect: () => {
        setConnected(true);
        setError(null);

        client.subscribe(
          `/topic/consultation.${consultationId}`,
          (frame) => {
            try {
              const notification = JSON.parse(frame.body);
              if (notification.type === "NEW_MESSAGE") {
                onMessageRef.current?.(notification.payload);
              }
            } catch (e) {
              console.error("WS parse error:", e);
            }
          }
        );

        client.subscribe("/topic/online-status", (frame) => {
          try {
            const notification = JSON.parse(frame.body);
            if (notification.type === "USER_ONLINE" || notification.type === "USER_OFFLINE") {
              onOnlineStatusRef.current?.(notification.payload);
            }
          } catch (e) {
            console.error("WS parse error:", e);
          }
        });
      },

      onStompError: (frame) => {
        setError(frame.headers?.message || "WebSocket error");
        setConnected(false);
      },

      onDisconnect: () => {
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [consultationId]); // ✅ seulement consultationId, plus onMessage/onOnlineStatus

  const sendMessage = useCallback(
    ({ contenu, anonymat = false }) => {
      if (!clientRef.current?.connected) {
        setError("WebSocket non connecté");
        return false;
      }
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ contenu, anonymat, consultationId }),
      });
      return true;
    },
    [consultationId]
  );

  return { connected, error, sendMessage };
}