// hooks/useWebSocket.js
import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = "http://localhost:9191/ws-consultation";

export function useWebSocket({ consultationId, onMessage, onOnlineStatus }) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const reconnectDelay = useRef(3000);

  useEffect(() => {
    if (!consultationId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: reconnectDelay.current,

      onConnect: () => {
        setConnected(true);
        setError(null);
        reconnectDelay.current = 3000;

        // S'abonne au topic de la consultation
        client.subscribe(
          `/topic/consultation.${consultationId}`,
          (frame) => {
            try {
              const notification = JSON.parse(frame.body);
              if (notification.type === "NEW_MESSAGE") {
                onMessage?.(notification.payload);
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        );

        // S'abonne aux statuts en ligne
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
            console.error("Parse error:", e);
          }
        });

        // Erreurs personnelles
        client.subscribe("/user/queue/errors", (frame) => {
          const notification = JSON.parse(frame.body);
          setError(notification.payload);
        });
      },

      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        setError("Erreur WebSocket: " + frame.headers?.message);
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [consultationId]);

  const sendMessage = useCallback(
    ({ contenu, anonymat = false }) => {
      if (!clientRef.current?.connected) {
        setError("Non connecté au serveur");
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