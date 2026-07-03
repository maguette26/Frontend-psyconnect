import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Square, Send } from "lucide-react";
import api from "../services/api";
import { getCurrentUserInfo } from "../services/serviceAuth";

const PSYBOT_URL = import.meta.env.VITE_PSYBOT_URL;

/* ─────────────────── AVATARS ─────────────────── */
const BotAvatar = () => (
  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="white" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="white" stroke="none" />
    </svg>
  </div>
);

const UserAvatar = () => (
  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #DBEAFE, #BFDBFE)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </div>
);

/* ─────────────────── TYPING DOTS ─────────────────── */
const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#94a3b8", animation: `psyDot 1.3s ease-in-out ${i * 0.22}s infinite` }} />
    ))}
  </div>
);

/* ─────────────────── ACTION BUTTON ─────────────────── */
const ActionBtn = ({ icon, label, onClick, danger }) => {
  const [hov, setHov] = useState(false);
  const icons = {
    edit: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    copy: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
    trash: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
  };
  return (
    <button onClick={onClick} title={label}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 4, background: hov ? (danger ? "#fff1f2" : "#f8fafc") : "#fff", border: `1px solid ${hov ? (danger ? "#fca5a5" : "#cbd5e1") : "#e2e8f0"}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: hov ? (danger ? "#ef4444" : "#475569") : "#94a3b8", fontSize: 11, transition: "all 0.15s" }}>
      {icons[icon]} {label}
    </button>
  );
};

/* ─────────────────── MESSAGE ─────────────────── */
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
    if (editText.trim()) onEdit(msg.id, editText.trim());
    setEditing(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 6 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, maxWidth: "80%" }}>
        {!isUser && <div style={{ marginBottom: editing ? 54 : 30 }}><BotAvatar /></div>}
        <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
          {editing ? (
            <div style={{ background: "#fff", border: "2px solid #2563EB", borderRadius: 14, padding: 12, minWidth: 240 }}>
              <textarea ref={editRef} value={editText}
                onChange={e => { setEditText(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(); } if (e.key === "Escape") setEditing(false); }}
                style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: 14, fontFamily: "inherit", color: "#111", background: "transparent", lineHeight: 1.6, minHeight: 40, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setEditing(false)} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 7, padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "#64748b" }}>Annuler</button>
                <button onClick={saveEdit} style={{ background: "#1e293b", border: "none", borderRadius: 7, padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "#fff" }}>Enregistrer</button>
              </div>
            </div>
          ) : (
            <div style={{ background: isUser ? "#1e293b" : "#f1f5f9", color: isUser ? "#f8fafc" : "#1e293b", padding: "11px 16px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: 14.5, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", letterSpacing: "-0.01em", boxShadow: isUser ? "0 2px 12px rgba(30,41,59,0.12)" : "none" }}>
              {msg.text}
            </div>
          )}
          <span style={{ fontSize: 11, color: "#cbd5e1", marginTop: 4, paddingInline: 3 }}>{msg.time}</span>
          <div style={{ display: "flex", gap: 4, marginTop: 2, opacity: hovered && !editing ? 1 : 0, transition: "opacity 0.15s", justifyContent: isUser ? "flex-end" : "flex-start" }}>
            {isUser && <ActionBtn icon="edit" label="Modifier" onClick={() => { setEditText(msg.text); setEditing(true); }} />}
            <ActionBtn icon="copy" label="Copier" onClick={() => navigator.clipboard.writeText(msg.text)} />
            <ActionBtn icon="trash" label="Supprimer" onClick={() => onDelete(msg.id)} danger />
          </div>
        </div>
        {isUser && <div style={{ marginBottom: 52 }}><UserAvatar /></div>}
      </div>
    </div>
  );
};

/* ─────────────────── HOOK: Web Speech API native ─────────────────── */
function useSpeech(onResult) {
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      onResult(transcript);
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    recognitionRef.current = rec;
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.start(); setIsRecording(true); } catch (_) {}
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch (_) {}
    setIsRecording(false);
  }, []);

  return { isRecording, supported, start, stop };
}

const formatTime = (dateLike) => {
  const d = dateLike ? new Date(dateLike) : new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const WELCOME_MESSAGE = {
  id: 1, sender: "bot",
  text: "Bonjour, je suis PsyBot. Je suis là pour vous écouter et vous accompagner.\n\nComment vous sentez-vous aujourd'hui ?",
  time: formatTime(),
};

/* ─────────────────── MAIN CHATBOT ─────────────────── */
export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const { isRecording, supported: micSupported, start: startMic, stop: stopMic } =
    useSpeech((text) => setInput(text));

  // Sync statut auth + userId (même pattern que Forum.jsx)
  useEffect(() => {
    const sync = () => {
      setUserId(localStorage.getItem("userId"));
      try {
        const profil = getCurrentUserInfo();
        setIsAuthenticated(!!(profil && profil.token));
      } catch {
        setIsAuthenticated(false);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Chargement des messages : historique backend si connecté, sinon localStorage invité
  useEffect(() => {
    setHistoryLoaded(false);

    const loadGuestMessages = () => {
      const saved = localStorage.getItem(`psybot_guest`);
      setMessages(saved ? JSON.parse(saved) : [WELCOME_MESSAGE]);
      setHistoryLoaded(true);
    };

    const loadUserHistory = async () => {
      try {
        const res = await api.get("/psybot/historique");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map(m => ({
            id: m.id,
            sender: m.sender,
            text: m.contenu,
            time: formatTime(m.dateEnvoi),
          }));
          setMessages(mapped);
        } else {
          setMessages([WELCOME_MESSAGE]);
        }
      } catch (err) {
        console.error("Erreur chargement historique PsyBot:", err);
        setMessages([WELCOME_MESSAGE]);
      } finally {
        setHistoryLoaded(true);
      }
    };

    if (isAuthenticated) {
      loadUserHistory();
    } else {
      loadGuestMessages();
    }
  }, [isAuthenticated]);

  // Sauvegarde locale uniquement pour les invités (les connectés sont persistés côté backend)
  useEffect(() => {
    if (!historyLoaded || isAuthenticated) return;
    if (messages.length) localStorage.setItem(`psybot_guest`, JSON.stringify(messages));
  }, [messages, isAuthenticated, historyLoaded]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 130) + "px";
  };

  // Sauvegarde un message côté backend, uniquement si connecté — n'échoue jamais l'UI si erreur
  const persistMessage = async (sender, contenu) => {
    if (!isAuthenticated) return;
    try {
      await api.post("/psybot/message", { sender, contenu });
    } catch (err) {
      console.error("Erreur sauvegarde message PsyBot:", err);
    }
  };

  const sendMessage = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text) return;
    if (isRecording) stopMic();
    const userMsg = {
      id: Date.now(), sender: "user", text,
      time: formatTime(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    persistMessage("user", text);

    try {
      const res = await fetch(`${PSYBOT_URL}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userId: userId || "guest" }),
      });
      const data = await res.json();
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, sender: "bot", text: data.reply,
          time: formatTime(),
        }]);
        setIsTyping(false);
        persistMessage("bot", data.reply);
      }, 500);
    } catch {
      setIsTyping(false);
      const errText = "Une erreur est survenue. Veuillez réessayer.";
      setMessages(prev => [...prev, {
        id: Date.now() + 1, sender: "bot",
        text: errText,
        time: formatTime(),
      }]);
      persistMessage("bot", errText);
    }
  };

  const deleteMessage = (id) => setMessages(prev => prev.filter(m => m.id !== id));
  const editMessage = (id, newText) => setMessages(prev => prev.map(m => m.id === id ? { ...m, text: newText } : m));

  const handleMicClick = () => {
    if (isRecording) { stopMic(); } else { setInput(""); startMic(); }
  };

  const suggestions = ["Je me sens anxieux", "J'ai du mal à dormir", "Je traverse une période difficile", "Comment gérer le stress ?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#fff", fontFamily: "'ui-sans-serif', system-ui, sans-serif" }}>
      <style>{`
        @keyframes psySlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes psyDot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes micPulse { 0%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)} 70%{box-shadow:0 0 0 9px rgba(239,68,68,0)} 100%{box-shadow:0 0 0 0 rgba(239,68,68,0)} }
        @keyframes micWave { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.6)} }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #94a3b8; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .mic-btn:hover { background: #f8fafc !important; }
        .mic-btn.active:hover { background: #dc2626 !important; }
        .send-btn:hover:not(:disabled) { transform: scale(1.08); }
      `}</style>

      

      {/* ── MESSAGES ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px 12px", maxWidth: 740, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {messages.length <= 1 && (
          <div style={{ marginBottom: 28, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 22, padding: "8px 16px", fontSize: 13, color: "#475569", cursor: "pointer", transition: "all 0.18s", fontFamily: "inherit" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.borderColor = "#BFDBFE"; e.currentTarget.style.color = "#2563EB"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
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
            <div style={{ background: "#f1f5f9", padding: "11px 16px", borderRadius: "18px 18px 18px 4px" }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ZONE ── */}
      <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 16px 18px", background: "#fff" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>

          {isRecording && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 12, padding: "7px 14px", marginBottom: 8, animation: "psySlideIn 0.2s ease" }}>
              <div style={{ display: "flex", gap: 3, alignItems: "center", height: 20 }}>
                {[0.3, 0.6, 1, 0.7, 0.4].map((h, i) => (
                  <div key={i} style={{ width: 3, height: 20 * h, borderRadius: 3, background: "#ef4444", animation: `micWave 0.7s ease-in-out ${i * 0.1}s infinite` }} />
                ))}
              </div>
              <span style={{ fontSize: 12.5, color: "#dc2626", fontWeight: 500, flex: 1 }}>
                Enregistrement… Parlez maintenant.
              </span>
              <button onClick={stopMic} style={{ fontSize: 11.5, color: "#dc2626", background: "none", border: "1px solid #fca5a5", borderRadius: 8, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit" }}>
                Arrêter
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 18, padding: "8px 10px", transition: "border-color 0.2s, box-shadow 0.2s" }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = "#93C5FD"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>

            <textarea
              ref={textareaRef}
              value={input}
              placeholder={isRecording ? "Parlez maintenant…" : "Écrivez votre message… (Entrée pour envoyer)"}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={1}
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 14.5, color: "#1e293b", resize: "none", fontFamily: "inherit", lineHeight: 1.55, maxHeight: 130, overflowY: "auto", letterSpacing: "-0.01em", paddingTop: 3 }}
            />

            <div style={{ display: "flex", gap: 7, alignItems: "center", flexShrink: 0 }}>

              {micSupported && (
                <button
                  className={`mic-btn${isRecording ? " active" : ""}`}
                  onClick={handleMicClick}
                  title={isRecording ? "Arrêter l'enregistrement" : "Dicter un message"}
                  style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    border: isRecording ? "none" : "1.5px solid #e2e8f0",
                    background: isRecording ? "#ef4444" : "#fff",
                    color: isRecording ? "#fff" : "#64748b",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                    animation: isRecording ? "micPulse 1.4s ease-out infinite" : "none",
                    boxShadow: isRecording ? "0 2px 10px rgba(239,68,68,0.4)" : "none",
                  }}>
                  {isRecording ? <Square size={15} fill="currentColor" /> : <Mic size={17} strokeWidth={2.2} />}
                </button>
              )}

              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                title="Envoyer"
                style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  border: "none",
                  background: input.trim() ? "linear-gradient(135deg, #3b82f6, #2563EB)" : "#e2e8f0",
                  color: input.trim() ? "#fff" : "#94a3b8",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: input.trim() ? "0 2px 10px rgba(37,99,235,0.4)" : "none",
                }}>
                <Send size={16} strokeWidth={2.2} />
              </button>

            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#cbd5e1", marginTop: 7, marginBottom: 0 }}>
            PsyBot peut faire des erreurs. Consultez un professionnel pour un suivi médical.
          </p>
        </div>
      </div>
    </div>
  );
}