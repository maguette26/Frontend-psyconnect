import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConsultation, getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";

export default function ChatPage(props) {
  const { consultationId } = useParams();
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
    let isMounted = true;

    async function loadData() {
      try {
        const [consultationRes, chatRes] = await Promise.allSettled([
          getConsultation(consultationId),
          getChatHistory(consultationId),
        ]);

        if (!isMounted) return;

        // =====================
        // CONSULTATION (OBLIGATOIRE)
        // =====================
        if (consultationRes.status === "fulfilled") {
          const c = consultationRes.value;
          setConsultation(c);

          // accès autorisé seulement si CONFIRMEE
          if (c.statut !== "CONFIRMEE") {
            navigate("/consultations");
            return;
          }
        } else {
          console.error("Consultation error:", consultationRes.reason);
          navigate("/consultations");
          return;
        }

        // =====================
        // CHAT (OPTIONNEL)
        // =====================
        if (chatRes.status === "fulfilled") {
          setMessages(chatRes.value || []);
        } else {
          console.warn("Chat history inaccessible:", chatRes.reason);
          setMessages([]);
        }

      } catch (err) {
        console.error("ChatPage fatal error:", err);
        navigate("/consultations");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [consultationId, navigate]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-4">
      <h2>Chat consultation #{consultationId}</h2>

      {/* MESSAGES */}
      <div className="border p-3 h-96 overflow-auto">
        {messages.map((m, i) => (
          <div key={m.id || i}>
            <b>{m.expediteurNom}</b> : {m.contenu}
          </div>
        ))}
      </div>

      {/* TEST SEND BUTTON */}
      <div style={{ marginTop: 10 }}>
        <button
          onClick={() =>
            sendMessage({ contenu: "test message", anonymat: false })
          }
        >
          Envoyer test
        </button>
      </div>

      {/* STATUS */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {connected ? <p>🟢 Connecté</p> : <p>🔴 Déconnecté</p>}
    </div>
  );
}