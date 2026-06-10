import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getChatHistory } from "../services/api";
import { getConsultations } from "../services/servicePsy";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  Send,
  ArrowLeft,
  Clock,
  CheckCircle
} from "lucide-react";

/* =========================
   HELPERS
========================= */

const isConsultationStarted = (consultation) => {
  if (!consultation) return false;

  const dateStr = consultation.jourConsultation || consultation.dateConsultation;
  const heureStr = consultation.heureConsultation;

  if (!dateStr || !heureStr) return true;

  try {
    const heure = heureStr.replace("H", ":").replace("h", ":").substring(0, 5);
    const dt = new Date(`${dateStr}T${heure}:00`);
    return new Date() >= dt;
  } catch {
    return true;
  }
};

const isConsultationTerminee = (consultation) => {
  if (!consultation) return false;
  return consultation.statut === "TERMINEE" || consultation.statut === "ANNULEE";
};

/* =========================
   CHAT PAGE
========================= */

export default function ChatPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const consultationFromState = location.state?.consultation;

  const [consultation, setConsultation] = useState(consultationFromState || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const messagesEndRef = useRef(null);

  const handleNewMessage = useRef((msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  const { connected, sendMessage } = useWebSocket({
    consultationId,
    onMessage: handleNewMessage.current,
  });

  /* =========================
     ROLE SAFE
  ========================= */

  const role = (localStorage.getItem("role") || "").toUpperCase();

  const getBackRoute = () => {
    if (role.includes("PROFESSIONNEL")) return "/consultations/pro";
    return "/consultations";
  };

  /* =========================
     SCROLL AUTO
  ========================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     LOAD DATA SAFE
  ========================= */

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);

        let data = consultationFromState;

        // 🔥 FIX IMPORTANT : fallback si refresh (state perdu)
        if (!data) {
          const all = await getConsultations();
          data = all.find(
            (c) => String(c.idConsultation) === String(consultationId)
          );

          if (!data) {
            navigate(getBackRoute());
            return;
          }

          setConsultation(data);
        }

        // sécurité statut
        if (
          data.statut !== "CONFIRMEE" &&
          data.statut !== "TERMINEE"
        ) {
          navigate(getBackRoute());
          return;
        }

        const chatRes = await getChatHistory(consultationId).catch(() => []);

        if (isMounted) {
          const normalized = (chatRes || []).map((m) => ({
            ...m,
            moi: m.moi ?? m.estMoi ?? false,
            contenu: m.contenu ?? m.message ?? "",
            expediteurNom: m.expediteurNom ?? m.senderName ?? "",
          }));

          setMessages(normalized);
        }

      } catch (err) {
        console.error("Chat error:", err);
        if (isMounted) navigate(getBackRoute());
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [consultationId]);

  /* =========================
     SEND MESSAGE
  ========================= */

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || !connected) return;

    sendMessage({ contenu: text, anonymat: false });
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  /* =========================
     NO CONSULTATION
  ========================= */

  if (!consultation) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Consultation introuvable</p>
      </div>
    );
  }

  /* =========================
     TERMINÉE
  ========================= */

  if (isConsultationTerminee(consultation)) {
    return (
      <div style={{ padding: 20 }}>
        <CheckCircle />
        <p>Consultation terminée</p>
        <button onClick={() => navigate(getBackRoute())}>
          Retour aux consultations
        </button>
      </div>
    );
  }

  /* =========================
     PAS COMMENCÉE
  ========================= */

  if (!isConsultationStarted(consultation)) {
    return (
      <div style={{ padding: 20 }}>
        <Clock />
        <p>Pas encore commencée</p>
        <button onClick={() => navigate(getBackRoute())}>
          Retour aux consultations
        </button>
      </div>
    );
  }

  /* =========================
     UI CHAT
========================= */

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", padding: 10 }}>
        <button onClick={() => navigate(getBackRoute())}>
          <ArrowLeft />
        </button>

        <div style={{ marginLeft: 10 }}>
          Consultation #{consultationId}
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.moi ? "right" : "left",
              marginBottom: 8
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: 10,
                borderRadius: 10,
                background: m.moi ? "#4f46e5" : "#e5e7eb",
                color: m.moi ? "#fff" : "#000",
              }}
            >
              {m.contenu}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div style={{ display: "flex", padding: 10, gap: 8 }}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
        />

        <button onClick={handleSend}>
          <Send />
        </button>
      </div>

    </div>
  );
}