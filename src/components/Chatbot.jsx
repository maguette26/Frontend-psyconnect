import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const PSYBOT_URL = import.meta.env.VITE_PSYBOT_URL;

const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="15" fill="#e8f4f8" stroke="#b8d9e8" strokeWidth="1"/>
    <ellipse cx="16" cy="15" rx="7" ry="6.5" fill="#fff" stroke="#c5dcea" strokeWidth="1"/>
    <circle cx="13" cy="14" r="1.8" fill="#5ba3c9"/>
    <circle cx="19" cy="14" r="1.8" fill="#5ba3c9"/>
    <circle cx="13.6" cy="13.4" r="0.6" fill="#fff"/>
    <circle cx="19.6" cy="13.4" r="0.6" fill="#fff"/>
    <path d="M13 18.5 Q16 20.5 19 18.5" stroke="#7ab8d4" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <rect x="14.5" y="8" width="3" height="2" rx="1" fill="#7ab8d4"/>
    <circle cx="16" cy="7.5" r="1.2" fill="#5ba3c9"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const MicIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: "50%", background: "#9ca3af",
        animation: `psyDot 1.3s ease-in-out ${i * 0.22}s infinite`
      }} />
    ))}
  </div>
);

const MessageActions = ({ onDelete, isUser }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {visible && (
        <div style={{
          display: "flex", gap: 2,
          marginTop: 4,
          justifyContent: isUser ? "flex-end" : "flex-start",
          animation: "psyFadeIn 0.15s ease"
        }}>
          <button onClick={onDelete} title="Supprimer" style={{
            background: "none", border: "1px solid #e5e7eb", borderRadius: 6,
            padding: "3px 7px", cursor: "pointer", color: "#9ca3af",
            display: "flex", alignItems: "center", gap: 4, fontSize: 11,
            transition: "all 0.15s"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#fef2f2"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "none"; }}>
            <TrashIcon /> Supprimer
          </button>
        </div>
      )}
      {!visible && <div style={{ height: 24 }} />}
    </div>
  );
};

const Message = ({ msg, onDelete }) => {
  const isUser = msg.sender === "user";
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      marginBottom: 8,
      animation: "psySlideIn 0.25s ease"
    }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, maxWidth: "82%" }}>
        {!isUser && (
          <div style={{ flexShrink: 0, marginBottom: 28 }}>
            <BotIcon />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
          <div style={{
            background: isUser ? "#1c1c1e" : "#f4f4f4",
            color: isUser ? "#f9f9f9" : "#1c1c1e",
            padding: "11px 16px",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            fontSize: 14.5,
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            letterSpacing: "-0.01em",
          }}>
            {msg.text}
          </div>
          <span style={{ fontSize: 11, color: "#b0b0b0", marginTop: 4, paddingLeft: 2, paddingRight: 2 }}>{msg.time}</span>
          <MessageActions onDelete={() => onDelete(msg.id)} isUser={isUser} />
        </div>
      </div>
    </div>
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
      text: "Bonjour, je suis PsyBot. Je suis là pour vous écouter et vous accompagner. Comment vous sentez-vous aujourd'hui ?",
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const startMic = () => { resetTranscript(); setIsRecording(true); SpeechRecognition.startListening({ language: "fr-FR", continuous: true }); };
  const stopMic = () => { setIsRecording(false); SpeechRecognition.stopListening(); };

  const suggestions = ["Je me sens anxieux", "J'ai du mal à dormir", "Je traverse une période difficile", "Comment gérer le stress ?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#ffffff", fontFamily: "'Söhne', 'ui-sans-serif', system-ui, sans-serif" }}>

      <style>{`
        @keyframes psySlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes psyFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes psyDot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes psyPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #b0b0b0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #f0f0f0", padding: "18px 24px 16px", textAlign: "center", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#eef6fb", border: "1px solid #d4ebf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BotIcon />
          </div>
          <span style={{ fontSize: 18, fontWeight: 600, color: "#111", letterSpacing: "-0.03em" }}>PsyBot</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5, maxWidth: 480, marginInline: "auto" }}>
          Assistant de soutien psychologique — aide à exprimer les émotions, gérer le stress et trouver des ressources adaptées.
        </p>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px 8px", maxWidth: 740, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {messages.length <= 1 && (
          <div style={{ marginBottom: 28, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} style={{
                background: "#f9f9f9", border: "1px solid #e5e7eb", borderRadius: 20,
                padding: "8px 16px", fontSize: 13, color: "#374151", cursor: "pointer",
                transition: "all 0.15s", letterSpacing: "-0.01em"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.borderColor = "#d1d5db"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map(m => <Message key={m.id} msg={m} onDelete={deleteMessage} />)}

        {isTyping && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 8, animation: "psySlideIn 0.25s ease" }}>
            <div style={{ flexShrink: 0 }}><BotIcon /></div>
            <div style={{ background: "#f4f4f4", padding: "11px 16px", borderRadius: "18px 18px 18px 4px" }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: "12px 16px 20px", background: "#fff", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 8,
            background: "#f9f9f9", border: "1.5px solid #e5e7eb",
            borderRadius: 16, padding: "10px 12px",
            transition: "border-color 0.2s",
          }}
            onFocusCapture={e => e.currentTarget.style.borderColor = "#d1d5db"}
            onBlurCapture={e => e.currentTarget.style.borderColor = "#e5e7eb"}>

            <textarea
              ref={textareaRef}
              value={input}
              placeholder={isRecording ? "Enregistrement..." : "Écrivez votre message..."}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={1}
              style={{
                flex: 1, border: "none", background: "transparent",
                fontSize: 14.5, color: "#111", resize: "none",
                fontFamily: "inherit", lineHeight: 1.55, maxHeight: 130,
                overflowY: "auto", letterSpacing: "-0.01em", paddingTop: 1,
              }}
            />

            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              {browserSupportsSpeechRecognition && (
                <button
                  onMouseDown={startMic} onMouseUp={stopMic} onMouseLeave={stopMic}
                  title="Message vocal"
                  style={{
                    width: 34, height: 34, borderRadius: "50%", border: "none",
                    background: isRecording ? "#ef4444" : "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: isRecording ? "#fff" : "#9ca3af",
                    animation: isRecording ? "psyPulse 1.2s infinite" : "none",
                    transition: "all 0.2s",
                  }}>
                  <MicIcon active={isRecording} />
                </button>
              )}

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                style={{
                  width: 34, height: 34, borderRadius: "50%", border: "none",
                  background: input.trim() ? "#1c1c1e" : "#e5e7eb",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: input.trim() ? "#fff" : "#9ca3af",
                  transition: "all 0.2s", transform: "scale(1)",
                }}
                onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                <SendIcon />
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#c4c4c4", marginTop: 8, marginBottom: 0, letterSpacing: "0.01em" }}>
            PsyBot peut faire des erreurs. Consultez un professionnel pour un suivi médical.
          </p>
        </div>
      </div>
    </div>
  );
}