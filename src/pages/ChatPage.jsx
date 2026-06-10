import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  Send,
  Video,
  ArrowLeft,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  MessageCircle
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
   STATUS SCREEN
========================= */

function StatusScreen({ icon: Icon, color, title, subtitle, onBack }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none" }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontWeight: 600 }}>Consultation</span>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 340 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px"
          }}>
            <Icon size={36} color="#fff" />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>{subtitle}</p>

          <button onClick={onBack}>
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [anonymat] = useState(false);

  const messagesEndRef = useRef(null);

  const handleNewMessage = useRef((msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  const { connected, sendMessage } = useWebSocket({
    consultationId,
    onMessage: handleNewMessage.current,
  });

  /* =========================
     ROLE + BACK ROUTE (FIX IMPORTANT)
  ========================= */

  const role = localStorage.getItem("role");

  const getBackRoute = () => {
    return role === "PROFESSIONNEL"
      ? "/consultations/pro"
      : "/consultations";
  };

  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        if (!consultationFromState) {
          navigate(getBackRoute());
          return;
        }

        if (
          consultationFromState.statut !== "CONFIRMEE" &&
          consultationFromState.statut !== "TERMINEE"
        ) {
          navigate("/consultations");
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
        console.error(err);
        if (isMounted) navigate("/consultations");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
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

    sendMessage({ contenu: text, anonymat });
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
      <StatusScreen
        icon={CheckCircle}
        color="#22c55e"
        title="Consultation terminée"
        subtitle="Chat fermé"
        onBack={() => navigate(getBackRoute())}
      />
    );
  }

  /* =========================
     PAS COMMENCÉE
  ========================= */

  if (!isConsultationStarted(consultation)) {
    return (
      <StatusScreen
        icon={Clock}
        color="#f59e0b"
        title="Pas encore commencée"
        subtitle="Revenez plus tard"
        onBack={() => navigate(getBackRoute())}
      />
    );
  }

  /* =========================
     DATA PRO
  ========================= */

  const pro = {
    prenom: consultation.professionnelPrenom,
    nom: consultation.professionnelNom,
    specialite: consultation.specialite,
  };

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
          Dr {pro.prenom} {pro.nom}
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.moi ? "right" : "left" }}>
            <div>{m.contenu}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div style={{ display: "flex", padding: 10 }}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>
          <Send />
        </button>
      </div>

    </div>
  );
}