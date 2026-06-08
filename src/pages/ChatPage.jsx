import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConsultation, getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";

export default function ChatPage({ currentUser }) {
  const params = useParams();
  const consultationId = params?.consultationId;
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const stompClient = useWebSocket();

  // ❗ SAFE CHECK
  if (!consultationId) {
    return (
      <div style={{ padding: 20 }}>
        ❌ Consultation introuvable (ID manquant)
      </div>
    );
  }

  // 1. LOAD DATA
  useEffect(() => {
    Promise.all([
      getConsultation(consultationId),
      getChatHistory(consultationId),
    ])
      .then(([c, history]) => {
        setConsultation(c);
        setMessages(history);

        if (c.statut !== "CONFIRMEE") {
          navigate("/consultations");
        }
      })
      .finally(() => setLoading(false));
  }, [consultationId]);

  // 2. WEBSOCKET
  useEffect(() => {
    if (!stompClient) return;

    const sub = stompClient.subscribe(
      `/topic/consultation/${consultationId}`,
      (msg) => {
        const data = JSON.parse(msg.body);

        if (data.type === "NEW_MESSAGE") {
          setMessages((prev) => [...prev, data]);
        }
      }
    );

    return () => sub.unsubscribe();
  }, [stompClient, consultationId]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-4">
      <h2>Chat consultation #{consultationId}</h2>

      <div className="border p-3 h-96 overflow-auto">
        {messages.map((m) => (
          <div key={m.id}>
            <b>{m.expediteurNom}</b> : {m.contenu}
          </div>
        ))}
      </div>
    </div>
  );
}