// hooks/useWebSocket.js
import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// 🔥 Railway backend
const WS_URL = "https://backend-psyconnect.up.railway.app/ws-consultation";

export function useWebSocket({ consultationId, onMessage, onOnlineStatus } = {}) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!consultationId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),

      reconnectDelay: 3000,

      onConnect: () => {
        setConnected(true);
        setError(null);

        // 💬 CHAT
        client.subscribe(
          `/topic/consultation.${consultationId}`,
          (frame) => {
            try {
              const notification = JSON.parse(frame.body);

              if (notification.type === "NEW_MESSAGE") {
                onMessage?.(notification.payload);
              }
            } catch (e) {
              console.error("WS parse error:", e);
            }
          }
        );

        // 🟢 ONLINE STATUS
        client.subscribe("/topic/online-status", (frame) => {
          try {
            const notification = JSON.parse(frame.body);

            if (
              notification.type === "USER_ONLINE" ||
              notification.type === "USER_OFFLINE"
            ) {
              onOnlineStatus?.(notification.payload);
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

    return () => client.deactivate();
  }, [consultationId, onMessage, onOnlineStatus]);

  const sendMessage = useCallback(
    ({ contenu, anonymat = false }) => {
      if (!clientRef.current?.connected) {
        setError("WebSocket non connecté");
        return false;
      }

      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          contenu,
          anonymat,
          consultationId,
        }),
      });

      return true;
    },
    [consultationId]
  );

  return { connected, error, sendMessage };
}