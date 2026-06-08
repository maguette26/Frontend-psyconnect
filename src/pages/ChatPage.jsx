import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConsultation, getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";

export default function ChatPage(props) {
  const { consultationId } = useParams(); // ✅ SAFE
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const { connected, error, sendMessage } = useWebSocket({
    consultationId,
    onMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
  });
console.log("CONSULTATION ID =", consultationId);
  // ❌ SAFE GUARD
  if (!consultationId) {
    return (
      <div style={{ padding: 20 }}>
        ❌ Consultation introuvable (ID manquant)
      </div>
    );
  }

  useEffect(() => {
    if (!consultationId) return;

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
      .catch((err) => console.error("API ERROR:", err))
      .finally(() => setLoading(false));
  }, [consultationId]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-4">
      <h2>Chat consultation #{consultationId}</h2>

      <div className="border p-3 h-96 overflow-auto">
        {messages.map((m, i) => (
          <div key={m.id || i}>
            <b>{m.expediteurNom}</b> : {m.contenu}
          </div>
        ))}
      </div>

      {/* SIMPLE INPUT (sans changer design) */}
      <div style={{ marginTop: 10 }}>
        <button
          onClick={() =>
            sendMessage({ contenu: "test message", anonymat: false })
          }
        >
          Envoyer test
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {connected ? <p>🟢 Connecté</p> : <p>🔴 Déconnecté</p>}
    </div>
  );
}