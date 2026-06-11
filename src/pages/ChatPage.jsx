import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { Send, Video, ArrowLeft, Wifi, WifiOff, Clock, CheckCircle, MessageCircle } from "lucide-react";

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

function StatusScreen({ icon: Icon, color, title, subtitle, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 10, color: "#475569", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontWeight: 600, color: "#0f172a" }}>Consultation</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 340 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <Icon size={36} color="#fff" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>{title}</h2>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: "0 0 24px" }}>{subtitle}</p>
          <button onClick={onBack} style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 500, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            Retour aux consultations
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ currentUser }) {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const consultationFromState = location.state?.consultation;

  const [consultation, setConsultation] = useState(consultationFromState || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [anonymat, setAnonymat] = useState(false);

  const messagesEndRef = useRef(null);

  // ✅ role détecté depuis localStorage ET depuis currentUser en fallback
  // Valeurs possibles stockées : "PROFESSIONNEL", "UTILISATEUR", "USER", etc.
  const role = localStorage.getItem("role") || currentUser?.role || "";
  const getBackRoute = () => {
    if (role === "PROFESSIONNEL") return "/consultations/pro";
    return "/consultations";
  };

  const handleNewMessage = useRef((msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  const { connected, sendMessage } = useWebSocket({
    consultationId,
    onMessage: handleNewMessage.current,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        if (!consultationFromState) {
          navigate(getBackRoute());
          return;
        }

        if (consultationFromState.statut !== "CONFIRMEE" && consultationFromState.statut !== "TERMINEE") {
          navigate(getBackRoute());
          return;
        }

        const chatRes = await getChatHistory(consultationId).catch((e) => {
          console.warn("Historique indisponible:", e);
          return [];
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
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, border: "2.5px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Chargement...</p>
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
        color="#22c55e"
        title="Consultation terminée"
        subtitle="Cette consultation est terminée. Le chat n'est plus disponible."
        onBack={() => navigate(getBackRoute())}
      />
    );
  }

  if (!isConsultationStarted(consultation)) {
    const dateStr = consultation.jourConsultation || consultation.dateConsultation;
    const heureStr = consultation.heureConsultation?.replace("H", "h") || "";
    const dateFormatee = dateStr
      ? new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
      : "";
    return (
      <StatusScreen
        icon={Clock}
        color="#f59e0b"
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

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", flexShrink: 0 }}>
        <button onClick={() => navigate(getBackRoute())} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 10, color: "#475569", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={20} />
        </button>

        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {pro.prenom?.[0]}{pro.nom?.[0]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Dr {pro.prenom} {pro.nom}
          </p>
          {pro.specialite && (
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {pro.specialite}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {consultation.lienVisio && (
            <a href={consultation.lienVisio} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#dcfce7", color: "#16a34a", borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              <Video size={13} /> Visio
            </a>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 10, fontSize: 11, fontWeight: 500, background: connected ? "#dcfce7" : "#fee2e2", color: connected ? "#16a34a" : "#ef4444" }}>
            {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {connected ? "En ligne" : "Hors ligne"}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, paddingTop: 60 }}>
            <div style={{ width: 52, height: 52, background: "#fff", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <MessageCircle size={22} color="#cbd5e1" />
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Aucun message pour l'instant.</p>
            <p style={{ color: "#cbd5e1", fontSize: 12, margin: 0 }}>Commencez la conversation.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={m.id || i} style={{ display: "flex", justifyContent: m.moi ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: 3, alignItems: m.moi ? "flex-end" : "flex-start" }}>
                {!m.moi && (
                  <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600, paddingLeft: 4 }}>
                    {m.anonymat ? "Anonyme" : m.expediteurNom}
                  </span>
                )}
                <div style={{
                  padding: "10px 14px",
                  borderRadius: m.moi ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: m.moi ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "#fff",
                  color: m.moi ? "#fff" : "#1e293b",
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: m.moi ? "0 2px 8px rgba(99,102,241,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
                }}>
                  {m.contenu}
                </div>
                {m.heure && (
                  <span style={{ fontSize: 10, color: "#cbd5e1", paddingLeft: 4, paddingRight: 4 }}>{m.heure}</span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: "12px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", maxWidth: 760, margin: "0 auto" }}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Écrire un message... (Entrée pour envoyer)"
            style={{
              flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 16,
              padding: "10px 14px", fontSize: 14, resize: "none",
              fontFamily: "'DM Sans', sans-serif",
              background: "#f8fafc", outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#6366f1"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !connected}
            style={{
              width: 44, height: 44, borderRadius: 14, border: "none",
              background: !inputValue.trim() || !connected ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: !inputValue.trim() || !connected ? "#94a3b8" : "#fff",
              cursor: !inputValue.trim() || !connected ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.15s",
              boxShadow: !inputValue.trim() || !connected ? "none" : "0 2px 8px rgba(99,102,241,0.3)",
            }}
          >
            <Send size={16} />
          </button>
        </div>
        {!connected && (
          <p style={{ textAlign: "center", fontSize: 11, color: "#f87171", margin: "6px 0 0" }}>
            Connexion perdue — tentative de reconnexion...
          </p>
        )}
      </div>
    </div>
  );
}