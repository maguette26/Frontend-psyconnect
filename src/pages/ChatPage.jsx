import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { Send, Video, ArrowLeft, Shield } from "lucide-react";

/* ───────── THEME iOS / DOCTOLIB ───────── */
const C = {
  bg: "#F5F7FB",
  card: "rgba(255,255,255,0.85)",
  border: "#E6EAF2",
  text: "#0F172A",
  sub: "#6B7280",
  blue: "#2563EB",   // iMessage
  green: "#10B981",
};

/* ───────── HELPERS (inchangés) ───────── */
const getBackRoute = () => "/tableauUtilisateur";

/* ───────── HEADER ───────── */
function Header({ consultation, connected, onBack }) {
  return (
    <div style={{
      height: 64,
      background: "rgba(255,255,255,0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      padding: "0 14px",
      gap: 10,
    }}>
      <button onClick={onBack} style={{
        background: "none",
        border: "none",
        fontSize: 18,
        cursor: "pointer"
      }}>
        ←
      </button>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          Dr {consultation?.professionnelPrenom} {consultation?.professionnelNom}
        </div>
        <div style={{ fontSize: 12, color: C.sub }}>
          {connected ? "🟢 En ligne" : "⚪ Hors ligne"}
        </div>
      </div>

      {consultation?.lienVisio && (
        <a href={consultation.lienVisio} target="_blank" style={{
          background: C.green,
          color: "white",
          padding: "6px 10px",
          borderRadius: 10,
          fontSize: 12,
          textDecoration: "none"
        }}>
          Visio
        </a>
      )}
    </div>
  );
}

/* ───────── MESSAGE ───────── */
function Message({ m }) {
  const isMe = m.moi;

  return (
    <div style={{
      display: "flex",
      justifyContent: isMe ? "flex-end" : "flex-start",
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: "75%",
        padding: "10px 14px",
        borderRadius: 18,
        fontSize: 14,
        lineHeight: 1.4,
        background: isMe ? C.blue : "#FFFFFF",
        color: isMe ? "white" : C.text,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        border: isMe ? "none" : `1px solid ${C.border}`,
      }}>
        {m.contenu}
      </div>
    </div>
  );
}

/* ───────── INPUT ───────── */
function Input({ value, setValue, onSend }) {
  return (
    <div style={{
      display: "flex",
      gap: 8,
      padding: 10,
      background: "white",
      borderTop: `1px solid ${C.border}`,
    }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Message..."
        style={{
          flex: 1,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "10px 14px",
          outline: "none",
        }}
      />

      <button
        onClick={onSend}
        style={{
          background: C.blue,
          color: "white",
          border: "none",
          borderRadius: 20,
          padding: "0 14px",
          cursor: "pointer",
        }}
      >
        <Send size={16} />
      </button>
    </div>
  );
}

/* ───────── CHAT PAGE ───────── */
export default function ChatPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const consultationFromState = location.state?.consultation;

  const [consultation] = useState(consultationFromState);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const { connected, sendMessage } = useWebSocket({
    consultationId,
    onMessage: (msg) => setMessages((p) => [...p, msg]),
  });

  useEffect(() => {
    if (!consultationFromState) navigate(getBackRoute());

    getChatHistory(consultationId)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, []);

  const send = () => {
    if (!input.trim()) return;

    sendMessage({ contenu: input });
    setInput("");
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: C.bg,
      fontFamily: "system-ui",
    }}>

      <Header
        consultation={consultation}
        connected={connected}
        onBack={() => navigate(getBackRoute())}
      />

      {/* CHAT */}
      <div style={{
        flex: 1,
        padding: 14,
        overflowY: "auto"
      }}>
        {messages.map((m, i) => (
          <Message key={i} m={m} />
        ))}
      </div>

      {/* INPUT */}
      <Input
        value={input}
        setValue={setInput}
        onSend={send}
      />
    </div>
  );
}