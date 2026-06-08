import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConsultation, getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";

export default function ChatPage({ currentUser }) {
  const { consultationId } = useParams();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ IMPORTANT: hook corrigé
  const { connected, sendMessage } = useWebSocket({
    consultationId,
    onMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
  });

  // ❗ protection
  if (!consultationId) {
    return (
      <div style={{ padding: 20 }}>
        ❌ Consultation introuvable (ID manquant)
      </div>
    );
  }

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getConsultation(consultationId),
      getChatHistory(consultationId),
    ])
      .then(([c, history]) => {
        if (!mounted) return;

        setConsultation(c);
        setMessages(history);

        if (c?.statut !== "CONFIRMEE") {
          navigate("/consultations");
        }
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [consultationId, navigate]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-4">
      <h2>Chat consultation #{consultationId}</h2>

      <div className="border p-3 h-96 overflow-auto">
        {messages.map((m, index) => (
          <div key={m.id || index}>
            <b>{m.expediteurNom}</b> : {m.contenu}
          </div>
        ))}
      </div>

      {/* connexion status */}
      <p style={{ marginTop: 10 }}>
        WebSocket: {connected ? "🟢 connecté" : "🔴 déconnecté"}
      </p>
    </div>
  );
}