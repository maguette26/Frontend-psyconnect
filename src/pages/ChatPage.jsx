import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConsultation, getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";

export default function ChatPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const stompClient = useWebSocket();

  // 1. LOAD DATA
  useEffect(() => {
    Promise.all([
      getConsultation(consultationId),
      getChatHistory(consultationId),
    ])
      .then(([c, history]) => {
        setConsultation(c);
        setMessages(history);

        // ❌ BLOQUER SI PAS CONFIRMEE
        if (c.statut !== "CONFIRMEE") {
          navigate("/consultations");
        }
      })
      .finally(() => setLoading(false));
  }, [consultationId]);

  // 2. AUTO LISTEN CHAT START EVENT (backup)
  useEffect(() => {
    if (!stompClient) return;

    const sub = stompClient.subscribe(
      `/topic/consultation/${consultationId}`,
      (msg) => {
        const data = JSON.parse(msg.body);

        if (data.type === "CONSULTATION_STARTED") {
          console.log("Chat activé !");
        }
      }
    );

    return () => sub.unsubscribe();
  }, [stompClient, consultationId]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-4">
      <h2>Chat consultation #{consultationId}</h2>

      {/* MESSAGES */}
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