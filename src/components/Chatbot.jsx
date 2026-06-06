 
import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const PSYBOT_URL = import.meta.env.VITE_PSYBOT_URL;

const BotAvatar = () => (
  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6ee7f7 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4"/>
      <circle cx="8.5" cy="15.5" r="1.5" fill="white" stroke="none"/>
      <circle cx="15.5" cy="15.5" r="1.5" fill="white" stroke="none"/>
    </svg>
  </div>
);

const UserAvatar = () => (
  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  </div>
);

const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#9ca3af", animation: `psyDot 1.3s ease-in-out ${i * 0.22}s infinite` }} />
    ))}
  </div>
);

const Message = ({ msg, onDelete, onEdit }) => {
  const isUser = msg.sender === "user";
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text);
  const editRef = useRef(null);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = "auto";
      editRef.current.style.height = editRef.current.scrollHeight + "px";
    }
  }, [editing]);

  const saveEdit = () => {
    if (editText.trim()) { onEdit(msg.id, editText.trim()); }
    setEditing(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 4 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, maxWidth: "80%" }}>
        {!isUser && <div style={{ marginBottom: editing ? 54 : 30 }}><BotAvatar /></div>}

        <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
          {editing ? (
            <div style={{ background: "#fff", border: "2px solid #3b82f6", borderRadius: 14, padding: 12, minWidth: 240, width: "100%" }}>
              <textarea ref={editRef} value={editText}
                onChange={e => { setEditText(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(); } if (e.key === "Escape") setEditing(false); }}
                style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: 14, fontFamily: "inherit", color: "#111", background: "transparent", lineHeight: 1.6, minHeight: 40, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setEditing(false)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 7, padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "#6b7280" }}>Annuler</button>
                <button onClick={saveEdit} style={{ background: "#1c1c1e", border: "none", borderRadius: 7, padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "#fff" }}>Enregistrer</button>
              </div>
            </div>
          ) : (
            <div style={{
              background: isUser ? "#1c1c1e" : "#f4f4f4",
              color: isUser ? "#f9f9f9" : "#111",
              padding: "11px 16px",
              borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              fontSize: 14.5, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word",
              letterSpacing: "-0.01em",
            }}>
              {msg.text}
            </div>
          )}

          <span style={{ fontSize: 11, color: "#c0c0c0", marginTop: 3, paddingInline: 3 }}>{msg.time}</span>

          {/* ACTION BUTTONS — always in DOM, visible on hover */}
          <div style={{
            display: "flex", gap: 4, marginTop: 2,
            opacity: hovered && !editing ? 1 : 0,
            transition: "opacity 0.15s",
            justifyContent: isUser ? "flex-end" : "flex-start",
          }}>
            {isUser && (
              <ActionBtn icon="edit" label="Modifier" onClick={() => { setEditText(msg.text); setEditing(true); }} />
            )}
            <ActionBtn icon="copy" label="Copier" onClick={() => navigator.clipboard.writeText(msg.text)} />
            <ActionBtn icon="trash" label="Supprimer" onClick={() => onDelete(msg.id)} danger />
          </div>
        </div>

        {isUser && <div style={{ marginBottom: 52 }}><UserAvatar /></div>}
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, label, onClick, danger }) => {
  const [hov, setHov] = useState(false);
  const icons = {
    edit: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    copy: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    trash: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  };
  return (
    <button onClick={onClick} title={label}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        background: hov ? (danger ? "#fef2f2" : "#f3f4f6") : "#fff",
        border: `1px solid ${hov ? (danger ? "#fca5a5" : "#d1d5db") : "#e5e7eb"}`,
        borderRadius: 6, padding: "3px 8px", cursor: "pointer",
        color: hov ? (danger ? "#ef4444" : "#374151") : "#9ca3af",
        fontSize: 11, transition: "all 0.15s",
      }}>
      {icons[icon]} {label}
    </button>
  );
};

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  useEffect(() => {
    const sync = () => setUserId(localStorage.getItem("userId"));
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`psybot_${userId || "guest"}`);
    setMessages(saved ? JSON.parse(saved) : [{
      id: 1, sender: "bot",
      text: "Bonjour, je suis PsyBot. Je suis là pour vous écouter et vous accompagner.\n\nComment vous sentez-vous aujourd'hui ?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  }, [userId]);

  useEffect(() => {
    if (messages.length) localStorage.setItem(`psybot_${userId || "guest"}`, JSON.stringify(messages));
  }, [messages, userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 130) + "px";
  };

  const sendMessage = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text) return;
    const userMsg = {
      id: Date.now(), sender: "user", text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    resetTranscript();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);
    try {
      const res = await fetch(`${PSYBOT_URL}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userId: userId || "guest" }),
      });
      const data = await res.json();
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, sender: "bot", text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
        setIsTyping(false);
      }, 500);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, sender: "bot",
        text: "Une erreur est survenue. Veuillez réessayer.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  };

  const deleteMessage = (id) => setMessages(prev => prev.filter(m => m.id !== id));
  const editMessage = (id, newText) => setMessages(prev => prev.map(m => m.id === id ? { ...m, text: newText } : m));

  const startMic = () => { resetTranscript(); setIsRecording(true); SpeechRecognition.startListening({ language: "fr-FR", continuous: true }); };
  const stopMic = () => { setIsRecording(false); SpeechRecognition.stopListening(); };

  const suggestions = ["Je me sens anxieux", "J'ai du mal à dormir", "Je traverse une période difficile", "Comment gérer le stress ?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#fff", fontFamily: "'ui-sans-serif', system-ui, sans-serif" }}>
      <style>{`
        @keyframes psySlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes psyDot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes psyPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 7px rgba(239,68,68,0)} }
        textarea:focus{outline:none} textarea::placeholder{color:#b0b0b0}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:10px}
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #f0f0f0", padding: "16px 24px", textAlign: "center", background: "#fff" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #6ee7f7, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4"/>
              <circle cx="8.5" cy="15.5" r="1.5" fill="white" stroke="none"/>
              <circle cx="15.5" cy="15.5" r="1.5" fill="white" stroke="none"/>
            </svg>
          </div>
          <span style={{ fontSize: 19, fontWeight: 600, color: "#111", letterSpacing: "-0.03em" }}>PsyBot</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5, maxWidth: 500, marginInline: "auto" }}>
          Assistant de soutien psychologique — aide à exprimer les émotions, gérer le stress et trouver des ressources adaptées.
        </p>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px 12px", maxWidth: 740, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {messages.length <= 1 && (
          <div style={{ marginBottom: 28, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} style={{ background: "#f9f9f9", border: "1px solid #e5e7eb", borderRadius: 20, padding: "8px 16px", fontSize: 13, color: "#374151", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.borderColor = "#d1d5db"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} style={{ animation: "psySlideIn 0.25s ease" }}>
            <Message msg={m} onDelete={deleteMessage} onEdit={editMessage} />
          </div>
        ))}

        {isTyping && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 8, animation: "psySlideIn 0.25s ease" }}>
            <BotAvatar />
            <div style={{ background: "#f4f4f4", padding: "11px 16px", borderRadius: "18px 18px 18px 4px" }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div style={{ padding: "10px 16px 18px", background: "#fff", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: "#f9f9f9", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "8px 10px", transition: "border-color 0.2s" }}
            onFocusCapture={e => e.currentTarget.style.borderColor = "#d1d5db"}
            onBlurCapture={e => e.currentTarget.style.borderColor = "#e5e7eb"}>

            <textarea ref={textareaRef} value={input}
              placeholder={isRecording ? "🔴 Enregistrement..." : "Écrivez votre message... (Entrée pour envoyer)"}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={1}
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 14.5, color: "#111", resize: "none", fontFamily: "inherit", lineHeight: 1.55, maxHeight: 130, overflowY: "auto", letterSpacing: "-0.01em", paddingTop: 3 }} />

            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>

              {/* BOUTON MICROPHONE */}
              {browserSupportsSpeechRecognition && (
                <button onMouseDown={startMic} onMouseUp={stopMic} onMouseLeave={stopMic} title="Message vocal"
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #e5e7eb", background: isRecording ? "#ef4444" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isRecording ? "#fff" : "#9ca3af", animation: isRecording ? "psyPulse 1.2s infinite" : "none", transition: "all 0.2s", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="12" rx="3"/>
                    <path d="M5 10a7 7 0 0 0 14 0"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="8" y1="22" x2="16" y2="22"/>
                  </svg>
                </button>
              )}

              {/* BOUTON ENVOYER */}
              <button onClick={() => sendMessage()} disabled={!input.trim()}
                style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: input.trim() ? "#1c1c1e" : "#e5e7eb", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", color: input.trim() ? "#fff" : "#9ca3af", transition: "all 0.2s", flexShrink: 0 }}
                onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#d1d1d1", marginTop: 7, marginBottom: 0 }}>
            PsyBot peut faire des erreurs. Consultez un professionnel pour un suivi médical.
          </p>
        </div>
      </div>
    </div>
  );
}