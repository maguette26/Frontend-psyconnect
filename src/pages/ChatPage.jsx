import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { Send, Video, ArrowLeft, Wifi, WifiOff, Clock, CheckCircle, MessageCircle, Shield } from "lucide-react";

/* ─── helpers ─── */
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

/* ─── StatusScreen ─── */
function StatusScreen({ icon: Icon, gradient, title, subtitle, onBack }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f4ff 0%, #fafbff 60%, #f0f7f4 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', 'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <div style={{
        background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(226,232,240,0.8)",
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 12
      }}>
        <button onClick={onBack} style={{
          background: "#f1f5f9", border: "none", cursor: "pointer",
          width: 36, height: 36, borderRadius: 10, color: "#475569",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s"
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"}
          onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 15 }}>Consultation</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 24,
            background: gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.12)"
          }}>
            <Icon size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>{title}</h2>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: "0 0 28px" }}>{subtitle}</p>
          <button onClick={onBack} style={{
            padding: "11px 24px", borderRadius: 14,
            border: "1.5px solid #e2e8f0", background: "#fff",
            color: "#475569", fontSize: 13, fontWeight: 600,
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.15s"
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
          >
            ← Retour aux consultations
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Avatar initiales ─── */
function Avatar({ prenom, nom, size = 42 }) {
  const initials = `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.32,
      flexShrink: 0, letterSpacing: 0.5,
      boxShadow: "0 4px 12px rgba(99,102,241,0.35)"
    }}>
      {initials || "?"}
    </div>
  );
}

/* ─── Bubble ─── */
function MessageBubble({ m, showSender }) {
  const isMoi = m.moi;
  return (
    <div style={{
      display: "flex", justifyContent: isMoi ? "flex-end" : "flex-start",
      gap: 8, alignItems: "flex-end"
    }}>
      {!isMoi && (
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: "linear-gradient(135deg, #6366f1, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 10, fontWeight: 700,
          boxShadow: "0 2px 6px rgba(99,102,241,0.3)"
        }}>
          {(m.anonymat ? "A" : (m.expediteurNom?.[0] || "?")).toUpperCase()}
        </div>
      )}
      <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", gap: 3, alignItems: isMoi ? "flex-end" : "flex-start" }}>
        {!isMoi && showSender && (
          <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600, paddingLeft: 2, letterSpacing: 0.2 }}>
            {m.anonymat ? "Anonyme" : m.expediteurNom}
          </span>
        )}
        <div style={{
          padding: "10px 15px",
          borderRadius: isMoi ? "20px 20px 5px 20px" : "5px 20px 20px 20px",
          background: isMoi
            ? "linear-gradient(135deg, #6366f1 0%, #5b21b6 100%)"
            : "#ffffff",
          color: isMoi ? "#fff" : "#1e293b",
          fontSize: 14, lineHeight: 1.55,
          boxShadow: isMoi
            ? "0 4px 16px rgba(99,102,241,0.28)"
            : "0 2px 8px rgba(15,23,42,0.07)",
          border: isMoi ? "none" : "1px solid rgba(226,232,240,0.8)",
          wordBreak: "break-word"
        }}>
          {m.contenu}
        </div>
        {m.heure && (
          <span style={{ fontSize: 10, color: "#94a3b8", padding: "0 4px" }}>
            {formatTime(m.heure)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── ChatPage ─── */
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

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const handleNewMessage = useRef((msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  const { connected, sendMessage } = useWebSocket({
    consultationId,
    onMessage: handleNewMessage.current,
  });

  /* offline message delay */
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

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #f0f4ff 0%, #fafbff 100%)",
        fontFamily: "'Inter', sans-serif"
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        `}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44,
            border: "3px solid #e0e7ff",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin 0.75s linear infinite"
          }} />
          <p style={{ color: "#94a3b8", fontSize: 13, margin: 0, fontWeight: 500 }}>Chargement de la conversation…</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94a3b8" }}>Consultation introuvable.</p>
      </div>
    );
  }

  if (isConsultationTerminee(consultation)) {
    return (
      <StatusScreen
        icon={CheckCircle}
        gradient="linear-gradient(135deg, #22c55e, #16a34a)"
        title="Consultation terminée"
        subtitle="Cette consultation est terminée. L'historique des messages reste consultable mais le chat est maintenant fermé."
        onBack={() => navigate(getBackRoute())}
      />
    );
  }

  if (!isConsultationStarted(consultation)) {
    const dateStr = consultation.jourConsultation || consultation.dateConsultation;
    const heureStr = consultation.heureConsultation?.replace("H", "h") || "";
    const dateFormatee = dateStr
      ? new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long",
      })
      : "";
    return (
      <StatusScreen
        icon={Clock}
        gradient="linear-gradient(135deg, #f59e0b, #d97706)"
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

  const canSend = inputValue.trim() && connected;

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg, #f0f4ff 0%, #f8faff 50%, #f4f0ff 100%)",
      fontFamily: "'Inter', 'DM Sans', sans-serif",
      overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(226,232,240,0.7)",
        padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 14,
        flexShrink: 0,
        boxShadow: "0 1px 20px rgba(99,102,241,0.06)"
      }}>
        <button
          onClick={() => navigate(getBackRoute())}
          style={{
            background: "#f1f5f9", border: "none", cursor: "pointer",
            width: 36, height: 36, borderRadius: 10, color: "#475569",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.15s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#1e293b"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
        >
          <ArrowLeft size={18} />
        </button>

        <Avatar prenom={pro.prenom} nom={pro.nom} size={42} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: 15, letterSpacing: -0.2 }}>
            Dr {pro.prenom} {pro.nom}
          </p>
          {pro.specialite && (
            <p style={{ margin: "1px 0 0", fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
              {pro.specialite}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {consultation.lienVisio && (
            <a
              href={consultation.lienVisio}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px",
                background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                color: "#15803d", borderRadius: 10,
                fontSize: 12, fontWeight: 600, textDecoration: "none",
                border: "1px solid #86efac",
                boxShadow: "0 2px 6px rgba(22,163,74,0.12)",
                transition: "all 0.15s"
              }}
            >
              <Video size={13} /> Visio
            </a>
          )}

          {/* Connexion pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 10,
            fontSize: 11, fontWeight: 600,
            background: connected ? "linear-gradient(135deg, #dcfce7, #bbf7d0)" : "linear-gradient(135deg, #fee2e2, #fecaca)",
            color: connected ? "#16a34a" : "#ef4444",
            border: `1px solid ${connected ? "#86efac" : "#fca5a5"}`,
            transition: "all 0.3s"
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: connected ? "#22c55e" : "#ef4444",
              animation: connected ? "none" : "blink 1.4s ease-in-out infinite"
            }} />
            {connected ? "En ligne" : "Hors ligne"}
          </div>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "24px 20px 12px",
        display: "flex", flexDirection: "column", gap: 12
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 14, paddingTop: 80, animation: "fadeUp 0.4s ease"
          }}>
            <div style={{
              width: 72, height: 72,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 22,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(99,102,241,0.1)",
              border: "1px solid rgba(226,232,240,0.8)"
            }}>
              <MessageCircle size={28} color="#c7d2fe" />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#475569", fontSize: 15, margin: "0 0 4px", fontWeight: 600 }}>
                Commencez la conversation
              </p>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                Vos messages sont confidentiels et sécurisés.
              </p>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 14px", borderRadius: 20,
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.12)"
            }}>
              <Shield size={11} color="#6366f1" />
              <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 500 }}>Chiffrement de bout en bout</span>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={m.id || i} style={{ animation: "fadeUp 0.2s ease" }}>
              <MessageBubble
                m={m}
                showSender={!m.moi && (i === 0 || messages[i - 1]?.moi !== false)}
              />
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT BAR ── */}
      <div style={{
        padding: "12px 20px 16px",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(226,232,240,0.7)",
        flexShrink: 0
      }}>
        {/* Anonymat toggle */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 10, paddingLeft: 2
        }}>
          <button
            onClick={() => setAnonymat(a => !a)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              padding: "3px 0"
            }}
          >
            <div style={{
              width: 32, height: 18, borderRadius: 9,
              background: anonymat ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "#e2e8f0",
              position: "relative", transition: "background 0.2s",
              flexShrink: 0
            }}>
              <div style={{
                position: "absolute", top: 2,
                left: anonymat ? 16 : 2,
                width: 14, height: 14, borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
              }} />
            </div>
            <span style={{ fontSize: 11, color: anonymat ? "#6366f1" : "#94a3b8", fontWeight: 500 }}>
              Mode anonyme
            </span>
          </button>
        </div>

        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          maxWidth: 800, margin: "0 auto"
        }}>
          <div style={{
            flex: 1, position: "relative",
            background: "#fff",
            borderRadius: 18,
            border: `1.5px solid ${inputFocused ? "#6366f1" : "rgba(226,232,240,0.9)"}`,
            boxShadow: inputFocused
              ? "0 0 0 4px rgba(99,102,241,0.08), 0 2px 12px rgba(0,0,0,0.06)"
              : "0 2px 8px rgba(0,0,0,0.05)",
            transition: "all 0.15s"
          }}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              rows={1}
              placeholder={anonymat ? "Message anonyme… (Entrée pour envoyer)" : "Écrire un message… (Entrée pour envoyer)"}
              style={{
                width: "100%", border: "none", outline: "none",
                padding: "12px 16px", fontSize: 14, resize: "none",
                fontFamily: "'Inter', sans-serif", background: "transparent",
                color: "#1e293b", lineHeight: 1.5,
                boxSizing: "border-box",
                maxHeight: 120, overflowY: "auto"
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{
              width: 46, height: 46, borderRadius: 15, border: "none",
              background: canSend
                ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                : "#f1f5f9",
              color: canSend ? "#fff" : "#cbd5e1",
              cursor: canSend ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: canSend ? "0 4px 16px rgba(99,102,241,0.35)" : "none",
              transition: "all 0.15s",
              transform: canSend ? "scale(1)" : "scale(0.96)"
            }}
            onMouseEnter={e => { if (canSend) e.currentTarget.style.transform = "scale(1.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = canSend ? "scale(1)" : "scale(0.96)"; }}
          >
            <Send size={17} style={{ marginLeft: 1 }} />
          </button>
        </div>

        {!connected && showOfflineMsg && (
          <p style={{
            textAlign: "center", fontSize: 11, color: "#f87171",
            margin: "8px 0 0", fontWeight: 500
          }}>
            Connexion en cours… le serveur peut prendre quelques secondes à répondre.
          </p>
        )}
      </div>
    </div>
  );
}