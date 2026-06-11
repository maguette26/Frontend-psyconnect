import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { Send, Video, ArrowLeft, Clock, CheckCircle, MessageCircle, Shield, Lock, Calendar, Stethoscope } from "lucide-react";

/* ─── helpers (inchangés) ─── */
const isConsultationStarted = (consultation) => {
  if (!consultation) return false;
  const dateStr = consultation.jourConsultation || consultation.dateConsultation;
  const heureStr = consultation.heureConsultation;
  if (!dateStr || !heureStr) return true;
  try {
    const heure = heureStr.replace("H", ":").replace("h", ":").substring(0, 5);
    const dt = new Date(`${dateStr}T${heure}:00`);
    return new Date() >= dt;
  } catch { return true; }
};

const isConsultationTerminee = (c) =>
  c?.statut === "TERMINEE" || c?.statut === "ANNULEE";

const getRoleFromStorage = () => {
  try {
    const raw = localStorage.getItem("currentUserInfo");
    if (!raw) return null;
    return JSON.parse(raw)?.role || null;
  } catch { return null; }
};

const getBackRoute = () => {
  const role = getRoleFromStorage();
  return role === "PSYCHOLOGUE" || role === "PSYCHIATRE"
    ? "/tableauProfessionnel"
    : "/tableauUtilisateur";
};

const formatTime = (heure) => {
  if (!heure) return "";
  return heure;
};

const formatDateFR = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
};

const formatHeureFR = (h) => {
  if (!h) return "";
  return h.replace("H", "h").replace(":", "h").substring(0, 5);
};

/* ─── Tokens ─── */
const T = {
  indigo: "#4F46E5",
  indigoLight: "#EEF2FF",
  indigoDark: "#3730A3",
  violet: "#7C3AED",
  teal: "#10B981",
  tealLight: "#D1FAE5",
  white: "#FFFFFF",
  bg: "#F8FAFC",
  surface: "rgba(255,255,255,0.92)",
  border: "rgba(226,232,240,0.8)",
  slate900: "#0F172A",
  slate700: "#334155",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  red: "#EF4444",
  redLight: "#FEE2E2",
  amber: "#F59E0B",
  amberLight: "#FEF3C7",
};

/* ─── Global Styles ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.slate200}; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: ${T.slate400}; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); }
    70%  { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
  }
  textarea { font-family: 'Inter', sans-serif; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

/* ─── StatusScreen ─── */
function StatusScreen({ icon: Icon, color, bgColor, title, subtitle, onBack }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${T.bg} 0%, ${T.white} 60%, #EFF6FF 100%)`,
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* Header */}
      <div style={{
        background: T.surface,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <BackButton onClick={onBack} />
        <span style={{ fontWeight: 700, color: T.slate900, fontSize: 15, letterSpacing: -0.3 }}>
          Consultation
        </span>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "2rem",
      }}>
        <div style={{ textAlign: "center", maxWidth: 380, animation: "fadeUp 0.4s ease" }}>
          <div style={{
            width: 96, height: 96, borderRadius: 28,
            background: bgColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: `0 16px 40px ${color}30`,
          }}>
            <Icon size={42} color={color} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.slate900, margin: "0 0 10px", letterSpacing: -0.5 }}>
            {title}
          </h2>
          <p style={{ fontSize: 14, color: T.slate500, lineHeight: 1.75, margin: "0 0 32px" }}>
            {subtitle}
          </p>
          <button
            onClick={onBack}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 14,
              border: `1.5px solid ${T.slate200}`,
              background: T.white, color: T.slate700,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.slate100; e.currentTarget.style.borderColor = T.slate400; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.white; e.currentTarget.style.borderColor = T.slate200; e.currentTarget.style.transform = "none"; }}
          >
            <ArrowLeft size={16} />
            Retour aux consultations
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared: BackButton ─── */
function BackButton({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? T.slate200 : T.slate100,
        border: "none", cursor: "pointer",
        width: 38, height: 38, borderRadius: 12,
        color: hov ? T.slate900 : T.slate500,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.15s",
        boxShadow: hov ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <ArrowLeft size={18} />
    </button>
  );
}

/* ─── Avatar ─── */
function Avatar({ prenom, nom, size = 44, online }) {
  const initials = `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: `linear-gradient(140deg, ${T.indigo} 0%, ${T.violet} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: size * 0.31,
        letterSpacing: 0.5,
        boxShadow: `0 6px 20px rgba(79,70,229,0.3)`,
        border: `2px solid rgba(255,255,255,0.9)`,
      }}>
        {initials || "?"}
      </div>
      {online !== undefined && (
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          width: 13, height: 13, borderRadius: "50%",
          background: online ? T.teal : T.red,
          border: `2px solid ${T.white}`,
          animation: online ? "pulseRing 2.5s infinite" : "none",
        }} />
      )}
    </div>
  );
}

/* ─── ConsultationInfoCard ─── */
function ConsultationInfoCard({ consultation }) {
  const dateStr = consultation.jourConsultation || consultation.dateConsultation || consultation.date;
  const heureStr = consultation.heureConsultation || consultation.heure;
  const statut = consultation.statut;

  const STATUT_STYLE = {
    CONFIRMEE:  { bg: T.tealLight,   color: T.teal,  label: "Confirmée" },
    EN_ATTENTE: { bg: T.amberLight,  color: T.amber, label: "En attente" },
    TERMINEE:   { bg: T.slate100,    color: T.slate500, label: "Terminée" },
    ANNULEE:    { bg: T.redLight,    color: T.red,   label: "Annulée" },
  };
  const st = STATUT_STYLE[statut] || STATUT_STYLE.EN_ATTENTE;

  return (
    <div style={{
      margin: "0 16px",
      padding: "12px 16px",
      background: "rgba(255,255,255,0.75)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: 16,
      border: `1px solid ${T.border}`,
      boxShadow: "0 2px 12px rgba(79,70,229,0.06)",
      display: "flex", alignItems: "center", gap: 12,
      flexWrap: "wrap",
    }}>
      {/* Date */}
      {dateStr && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: T.indigoLight,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Calendar size={13} color={T.indigo} />
          </div>
          <span style={{ fontSize: 12, color: T.slate700, fontWeight: 600 }}>
            {formatDateFR(dateStr)}
          </span>
        </div>
      )}

      {dateStr && heureStr && (
        <div style={{ width: 1, height: 20, background: T.slate200, flexShrink: 0 }} />
      )}

      {/* Heure */}
      {heureStr && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: T.indigoLight,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Clock size={13} color={T.indigo} />
          </div>
          <span style={{ fontSize: 12, color: T.slate700, fontWeight: 600 }}>
            {formatHeureFR(heureStr)}
          </span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Statut */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px", borderRadius: 20,
        background: st.bg, color: st.color,
        fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.color }} />
        {st.label}
      </span>

      {/* Sécurisé */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "4px 10px", borderRadius: 20,
        background: T.tealLight, color: T.teal,
        fontSize: 11, fontWeight: 600,
      }}>
        <Lock size={10} />
        Sécurisé
      </div>
    </div>
  );
}

/* ─── Message Bubble ─── */
function MessageBubble({ m, showSender, isNew }) {
  const isMoi = m.moi;
  return (
    <div style={{
      display: "flex",
      justifyContent: isMoi ? "flex-end" : "flex-start",
      gap: 8, alignItems: "flex-end",
      animation: isNew ? "slideIn 0.22s ease" : "none",
    }}>
      {/* Avatar expéditeur */}
      {!isMoi && (
        <div style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: `linear-gradient(135deg, ${T.indigo}, ${T.violet})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 11, fontWeight: 700,
          boxShadow: `0 2px 8px rgba(79,70,229,0.25)`,
        }}>
          {(m.anonymat ? "A" : (m.expediteurNom?.[0] || "?")).toUpperCase()}
        </div>
      )}

      <div style={{
        maxWidth: "70%", display: "flex",
        flexDirection: "column", gap: 4,
        alignItems: isMoi ? "flex-end" : "flex-start",
      }}>
        {/* Nom expéditeur */}
        {!isMoi && showSender && (
          <span style={{
            fontSize: 11, color: T.indigo, fontWeight: 700,
            paddingLeft: 4, letterSpacing: 0.1,
          }}>
            {m.anonymat ? "Anonyme" : m.expediteurNom}
          </span>
        )}

        {/* Bulle */}
        <div style={{
          padding: "11px 16px",
          borderRadius: isMoi ? "20px 20px 6px 20px" : "6px 20px 20px 20px",
          background: isMoi
            ? `linear-gradient(140deg, ${T.indigo} 0%, ${T.violet} 100%)`
            : T.white,
          color: isMoi ? "#fff" : T.slate900,
          fontSize: 14, lineHeight: 1.6,
          boxShadow: isMoi
            ? `0 6px 20px rgba(79,70,229,0.25)`
            : `0 2px 10px rgba(15,23,42,0.06)`,
          border: isMoi ? "none" : `1px solid rgba(226,232,240,0.9)`,
          wordBreak: "break-word",
          transition: "box-shadow 0.15s",
        }}>
          {m.contenu}
        </div>

        {/* Heure */}
        {m.heure && (
          <span style={{
            fontSize: 10, color: T.slate400,
            padding: "0 4px", fontWeight: 500,
          }}>
            {formatTime(m.heure)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Toggle Anonymat iOS style ─── */
function AnonymatToggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "none", border: "none", cursor: "pointer",
        padding: "4px 0",
      }}
    >
      {/* Track */}
      <div style={{
        width: 38, height: 22, borderRadius: 11,
        background: value
          ? `linear-gradient(135deg, ${T.indigo}, ${T.violet})`
          : T.slate200,
        position: "relative",
        transition: "background 0.22s",
        boxShadow: value ? `0 2px 8px rgba(79,70,229,0.3)` : "none",
        flexShrink: 0,
      }}>
        {/* Thumb */}
        <div style={{
          position: "absolute", top: 2,
          left: value ? 18 : 2,
          width: 18, height: 18, borderRadius: "50%",
          background: T.white,
          transition: "left 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
        }} />
      </div>
      <span style={{
        fontSize: 12, fontWeight: 600,
        color: value ? T.indigo : T.slate400,
        transition: "color 0.2s",
        userSelect: "none",
      }}>
        Mode anonyme
      </span>
    </button>
  );
}

/* ─── Loading Spinner ─── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(160deg, ${T.bg} 0%, ${T.white} 100%)`,
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {/* Spinner */}
        <div style={{ position: "relative", width: 56, height: 56 }}>
          <div style={{
            width: 56, height: 56,
            border: `3px solid ${T.indigoLight}`,
            borderTopColor: T.indigo,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Stethoscope size={18} color={T.indigo} />
          </div>
        </div>
        <p style={{ color: T.slate400, fontSize: 13, margin: 0, fontWeight: 500, letterSpacing: 0.1 }}>
          Chargement de la conversation…
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL ChatPage
═══════════════════════════════════════════ */
export default function ChatPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const consultationFromState = location.state?.consultation;

  const [consultation, setConsultation] = useState(consultationFromState || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [anonymat, setAnonymat] = useState(false);
  const [showOfflineMsg, setShowOfflineMsg] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const handleNewMessage = useRef((msg) => {
    setMessages((prev) => [...prev, msg]);
    setNewMsgCount(n => n + 1);
  });

  const { connected, sendMessage } = useWebSocket({
    consultationId,
    onMessage: handleNewMessage.current,
  });

  useEffect(() => {
    if (!connected) {
      const t = setTimeout(() => setShowOfflineMsg(true), 3000);
      return () => clearTimeout(t);
    }
    setShowOfflineMsg(false);
  }, [connected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        if (!consultationFromState) { navigate(getBackRoute()); return; }
        if (consultationFromState.statut !== "CONFIRMEE" && consultationFromState.statut !== "TERMINEE") {
          navigate(getBackRoute()); return;
        }
        const chatRes = await getChatHistory(consultationId).catch((e) => {
          console.warn("Historique indisponible:", e); return [];
        });
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
        console.error("ChatPage error:", err);
        if (isMounted) navigate(getBackRoute());
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [consultationId]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || !connected) return;
    sendMessage({ contenu: text, anonymat });
    setInputValue("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Guards ── */
  if (loading) return <LoadingScreen />;

  if (!consultation) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: "'Inter', sans-serif",
      }}>
        <p style={{ color: T.slate400 }}>Consultation introuvable.</p>
      </div>
    );
  }

  if (isConsultationTerminee(consultation)) {
    return (
      <StatusScreen
        icon={CheckCircle}
        color={T.teal}
        bgColor={T.tealLight}
        title="Consultation terminée"
        subtitle="Cette consultation est terminée. L'historique des messages reste consultable, mais le chat est désormais fermé."
        onBack={() => navigate(getBackRoute())}
      />
    );
  }

  if (!isConsultationStarted(consultation)) {
    const dateStr = consultation.jourConsultation || consultation.dateConsultation;
    const heureStr = consultation.heureConsultation?.replace("H", "h") || "";
    const dateFormatee = dateStr ? formatDateFR(dateStr) : "";
    return (
      <StatusScreen
        icon={Clock}
        color={T.amber}
        bgColor={T.amberLight}
        title="Pas encore commencée"
        subtitle={`Cette consultation n'a pas encore débuté. Elle est prévue le ${dateFormatee} à ${heureStr}. Revenez à ce moment-là.`}
        onBack={() => navigate(getBackRoute())}
      />
    );
  }

  const pro = {
    prenom: consultation.professionnelPrenom,
    nom: consultation.professionnelNom,
    specialite: consultation.specialite,
  };

  const canSend = !!inputValue.trim() && connected;

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: `linear-gradient(170deg, #EEF2FF 0%, ${T.bg} 40%, #F0FDF4 100%)`,
      fontFamily: "'Inter', 'DM Sans', sans-serif",
      overflow: "hidden",
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* ════════════════ HEADER ════════════════ */}
      <div style={{
        background: T.surface,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 14,
        flexShrink: 0,
        boxShadow: "0 1px 24px rgba(79,70,229,0.07)",
        zIndex: 10,
      }}>
        <BackButton onClick={() => navigate(getBackRoute())} />

        <Avatar prenom={pro.prenom} nom={pro.nom} size={44} online={connected} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontWeight: 800, color: T.slate900,
            fontSize: 15, letterSpacing: -0.3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            Dr {pro.prenom} {pro.nom}
          </p>
          {pro.specialite ? (
            <p style={{ margin: "1px 0 0", fontSize: 12, color: T.slate400, fontWeight: 500 }}>
              {pro.specialite}
            </p>
          ) : (
            <p style={{ margin: "1px 0 0", fontSize: 12, fontWeight: 600, color: connected ? T.teal : T.red }}>
              {connected ? "● En ligne" : "○ Hors ligne"}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Visio */}
          {consultation.lienVisio && (
            <a
              href={consultation.lienVisio}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 12,
                background: `linear-gradient(135deg, ${T.teal}, #059669)`,
                color: "#fff", fontSize: 12, fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                transition: "all 0.2s",
                letterSpacing: 0.1,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(16,185,129,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(16,185,129,0.3)"; }}
            >
              <Video size={13} /> Visio
            </a>
          )}

          {/* Statut connexion (si spécialité affichée dans le sous-titre) */}
          {pro.specialite && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "7px 12px", borderRadius: 12,
              fontSize: 11, fontWeight: 700,
              background: connected ? T.tealLight : T.redLight,
              color: connected ? T.teal : T.red,
              border: `1px solid ${connected ? "#6EE7B7" : "#FCA5A5"}`,
              transition: "all 0.3s",
              letterSpacing: 0.1,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: connected ? T.teal : T.red,
                animation: connected ? "pulseRing 2.5s infinite" : "blink 1.4s ease-in-out infinite",
              }} />
              {connected ? "En ligne" : "Hors ligne"}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════ CARTE CONSULTATION ════════════════ */}
      <div style={{ padding: "10px 0 6px", flexShrink: 0 }}>
        <ConsultationInfoCard consultation={consultation} />
      </div>

      {/* ════════════════ MESSAGES ════════════════ */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "16px 20px 8px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 18, paddingTop: 60,
            animation: "fadeUp 0.4s ease",
          }}>
            {/* Icône */}
            <div style={{
              width: 80, height: 80,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 30px rgba(79,70,229,0.1)",
              border: `1px solid ${T.border}`,
            }}>
              <MessageCircle size={32} color={T.indigoLight.replace("FF", "99")} strokeWidth={1.5} />
            </div>

            <div style={{ textAlign: "center", maxWidth: 260 }}>
              <p style={{
                color: T.slate700, fontSize: 16, margin: "0 0 6px",
                fontWeight: 700, letterSpacing: -0.2,
              }}>
                Commencez la conversation
              </p>
              <p style={{ color: T.slate400, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                Vos échanges sont confidentiels et protégés.
              </p>
            </div>

            {/* Badge sécurité */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 20,
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}>
              <Shield size={12} color={T.teal} />
              <span style={{ fontSize: 11, color: T.teal, fontWeight: 600, letterSpacing: 0.1 }}>
                Chiffrement de bout en bout
              </span>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <MessageBubble
              key={m.id || i}
              m={m}
              showSender={!m.moi && (i === 0 || messages[i - 1]?.moi !== false)}
              isNew={i >= messages.length - newMsgCount}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ════════════════ ZONE DE SAISIE ════════════════ */}
      <div style={{
        padding: "10px 16px 16px",
        background: T.surface,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${T.border}`,
        flexShrink: 0,
        boxShadow: "0 -4px 24px rgba(15,23,42,0.04)",
      }}>
        {/* Toggle anonymat */}
        <div style={{ marginBottom: 10, paddingLeft: 4 }}>
          <AnonymatToggle value={anonymat} onChange={setAnonymat} />
        </div>

        {/* Input row */}
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          maxWidth: 820, margin: "0 auto",
        }}>
          {/* Textarea */}
          <div style={{
            flex: 1, position: "relative",
            background: T.white,
            borderRadius: 20,
            border: `1.5px solid ${inputFocused ? T.indigo : T.slate200}`,
            boxShadow: inputFocused
              ? `0 0 0 4px rgba(79,70,229,0.1), 0 4px 16px rgba(0,0,0,0.06)`
              : `0 2px 10px rgba(0,0,0,0.04)`,
            transition: "all 0.2s",
            minHeight: 52,
            display: "flex", alignItems: "center",
          }}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              rows={1}
              placeholder={
                anonymat
                  ? "Message anonyme… (↵ pour envoyer)"
                  : "Écrire un message… (↵ pour envoyer)"
              }
              style={{
                width: "100%", border: "none", outline: "none",
                padding: "14px 18px",
                fontSize: 14, resize: "none",
                background: "transparent",
                color: T.slate900, lineHeight: 1.55,
                boxSizing: "border-box",
                maxHeight: 130, overflowY: "auto",
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{
              width: 52, height: 52, borderRadius: "50%",
              border: "none",
              background: canSend
                ? `linear-gradient(140deg, ${T.indigo} 0%, ${T.violet} 100%)`
                : T.slate100,
              color: canSend ? "#fff" : T.slate400,
              cursor: canSend ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: canSend ? `0 6px 20px rgba(79,70,229,0.35)` : "none",
              transition: "all 0.2s",
              transform: canSend ? "scale(1)" : "scale(0.94)",
            }}
            onMouseEnter={e => { if (canSend) { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = `0 8px 28px rgba(79,70,229,0.45)`; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = canSend ? "scale(1)" : "scale(0.94)"; e.currentTarget.style.boxShadow = canSend ? `0 6px 20px rgba(79,70,229,0.35)` : "none"; }}
          >
            <Send size={18} style={{ marginLeft: 1 }} />
          </button>
        </div>

        {/* Offline notice */}
        {!connected && showOfflineMsg && (
          <p style={{
            textAlign: "center", fontSize: 11,
            color: T.red, margin: "10px 0 0",
            fontWeight: 500, letterSpacing: 0.1,
          }}>
            Connexion en cours… le serveur peut prendre quelques secondes à répondre.
          </p>
        )}
      </div>
    </div>
  );
}