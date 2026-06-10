import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { Send, ArrowLeft, Clock, CheckCircle } from "lucide-react";

/* =========================
   HELPERS
========================= */

const isStarted = (c) => {
  if (!c) return false;
  const date = c.date || c.dateConsultation;
  const heure = c.heure || c.heureConsultation;

  if (!date || !heure) return true;

  try {
    const h = heure.replace("H", ":").substring(0, 5);
    return new Date() >= new Date(`${date}T${h}:00`);
  } catch {
    return true;
  }
};

const isFinished = (c) =>
  c?.statut === "TERMINEE" || c?.statut === "ANNULEE";

/* =========================
   CHAT PAGE
========================= */

export default function ChatPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [consultation, setConsultation] = useState(
    location.state?.consultation || null
  );

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");

  const role = localStorage.getItem("role");

  const backRoute =
    role === "PROFESSIONNEL"
      ? "/consultations"
      : "/consultations";

  const messagesEndRef = useRef(null);

  const { connected, sendMessage } = useWebSocket({
    consultationId,
    onMessage: (msg) => {
      setMessages((p) => [...p, msg]);
    },
  });

  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     LOAD CONSULTATION + CHAT
  ========================= */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        let data = consultation;

        // ✅ FIX IMPORTANT : si refresh → on récupère depuis backend
        if (!data) {
          const res = await api.get(`/consultations/${consultationId}`);
          data = res.data;
          setConsultation(data);
        }

        const chat = await getChatHistory(consultationId).catch(() => []);

        if (mounted) {
          setMessages(
            (chat || []).map((m) => ({
              ...m,
              moi: m.moi ?? m.estMoi ?? false,
              contenu: m.contenu ?? m.message ?? "",
            }))
          );
        }
      } catch (e) {
        console.error(e);
        navigate(backRoute); // fallback propre
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [consultationId]);

  /* =========================
     SEND MESSAGE
  ========================= */

  const handleSend = () => {
    if (!input.trim() || !connected) return;

    sendMessage({
      contenu: input,
    });

    setInput("");
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Chargement...
      </div>
    );
  }

  /* =========================
     NO DATA
  ========================= */

  if (!consultation) {
    return (
      <div style={{ padding: 20 }}>
        Consultation introuvable
      </div>
    );
  }

  /* =========================
     STATUS TERMINEE
  ========================= */

  if (isFinished(consultation)) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <CheckCircle />
        <p>Consultation terminée</p>
        <button onClick={() => navigate(backRoute)}>
          Retour
        </button>
      </div>
    );
  }

  /* =========================
     STATUS PAS COMMENCÉE
  ========================= */

  if (!isStarted(consultation)) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Clock />
        <p>Pas encore commencée</p>
        <button onClick={() => navigate(backRoute)}>
          Retour
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
      <div style={{ display: "flex", padding: 10, alignItems: "center" }}>
        <button onClick={() => navigate(backRoute)}>
          <ArrowLeft />
        </button>

        <div style={{ marginLeft: 10 }}>
          Consultation #{consultationId}
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.moi ? "right" : "left" }}>
            {m.contenu}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div style={{ display: "flex", padding: 10 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSend}>
          <Send />
        </button>
      </div>
    </div>
  );
}