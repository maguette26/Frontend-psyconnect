import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const PSYBOT_URL = import.meta.env.VITE_PSYBOT_URL;

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  useEffect(() => {
    const sync = () => setUserId(localStorage.getItem("userId"));
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    const defaultMsg = [{
      id: Date.now(),
      sender: "bot",
      text: "Bonjour, je suis PsyBot, votre assistant dédié à la santé mentale. Comment puis-je vous aider aujourd'hui ?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }];
    const saved = localStorage.getItem(`psybot_${userId || "guest"}`);
    setMessages(saved ? JSON.parse(saved) : defaultMsg);
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`psybot_${userId || "guest"}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (textOverride) => {
    const text = textOverride || input;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    resetTranscript();
    setIsTyping(true);

    try {
      const res = await fetch(`${PSYBOT_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), userId: userId || "guest" }),
      });
      const data = await res.json();
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: "bot",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
        setIsTyping(false);
      }, 600);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "bot",
        text: "Une erreur temporaire s'est produite. Veuillez réessayer.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const saveEdit = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: editText } : m));
    setEditingId(null);
    setEditText("");
  };

  const clearConversation = () => {
    const defaultMsg = [{
      id: Date.now(),
      sender: "bot",
      text: "Conversation réinitialisée. Comment puis-je vous aider ?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }];
    setMessages(defaultMsg);
  };

  const startMic = () => {
    resetTranscript();
    setIsRecording(true);
    SpeechRecognition.startListening({ language: "fr-FR", continuous: true });
  };

  const stopMic = () => {
    setIsRecording(false);
    SpeechRecognition.stopListening();
  };

  const suggestions = [
    "Je me sens anxieux en ce moment",
    "J'ai du mal à dormir",
    "Je traverse une période difficile",
    "Comment gérer le stress ?",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "#1e293b" }}>PsyBot</p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Assistant santé mentale • Toujours disponible</p>
          </div>
        </div>
        <button onClick={clearConversation} title="Nouvelle conversation" style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
          Nouvelle conversation
        </button>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", maxWidth: 780, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* Suggestions si début de conversation */}
        {messages.length <= 1 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12, textAlign: "center" }}>Sujets fréquents</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "8px 16px", fontSize: 13, color: "#475569", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.target.style.background = "#f1f5f9"; e.target.style.borderColor = "#cbd5e1"; }}
                  onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "#e2e8f0"; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.sender === "user" ? "flex-end" : "flex-start", marginBottom: 16, alignItems: "flex-end", gap: 8 }}
            onMouseEnter={() => setHoveredId(m.id)} onMouseLeave={() => setHoveredId(null)}>

            {/* Avatar bot */}
            {m.sender === "bot" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
            )}

            <div style={{ maxWidth: "72%", position: "relative" }}>
              {editingId === m.id ? (
                <div style={{ background: "#fff", border: "1px solid #6366f1", borderRadius: 12, padding: 12, minWidth: 200 }}>
                  <textarea value={editText} onChange={e => setEditText(e.target.value)} style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: 14, fontFamily: "inherit", color: "#1e293b", background: "transparent", minHeight: 60 }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => setEditingId(null)} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#64748b" }}>Annuler</button>
                    <button onClick={() => saveEdit(m.id)} style={{ background: "#6366f1", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#fff" }}>Enregistrer</button>
                  </div>
                </div>
              ) : (
                <div style={{ background: m.sender === "user" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#fff", color: m.sender === "user" ? "#fff" : "#1e293b", padding: "10px 14px", borderRadius: m.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: 14, lineHeight: 1.6, border: m.sender === "bot" ? "1px solid #e2e8f0" : "none", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {m.text}
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>{m.time}</div>
                </div>
              )}

              {/* Actions au survol */}
              {hoveredId === m.id && editingId !== m.id && (
                <div style={{ position: "absolute", top: -32, right: m.sender === "user" ? 0 : "auto", left: m.sender === "bot" ? 0 : "auto", display: "flex", gap: 4, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 6px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 10 }}>
                  {m.sender === "user" && (
                    <button onClick={() => startEdit(m)} title="Modifier" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 4, color: "#64748b", display: "flex", alignItems: "center" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  )}
                  <button onClick={() => navigator.clipboard.writeText(m.text)} title="Copier" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 4, color: "#64748b", display: "flex", alignItems: "center" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                  <button onClick={() => deleteMessage(m.id)} title="Supprimer" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 4, color: "#ef4444", display: "flex", alignItems: "center" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Avatar user */}
            {m.sender === "user" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 600, color: "#475569" }}>
                {userId ? userId.toString()[0].toUpperCase() : "U"}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#94a3b8", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "12px 20px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: "10px 14px", display: "flex", alignItems: "flex-end", gap: 8, transition: "border-color 0.2s" }}
            onFocus={() => {}} onClick={() => inputRef.current?.focus()}>
            <textarea ref={inputRef} value={input} placeholder={isRecording ? "Enregistrement en cours..." : "Écrivez votre message..."}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={1} style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#1e293b", resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 120, overflowY: "auto" }}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} />
          </div>

          {/* Mic */}
          {browserSupportsSpeechRecognition && (
            <button onMouseDown={startMic} onMouseUp={stopMic} onMouseLeave={stopMic}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid #e2e8f0", background: isRecording ? "#ef4444" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={isRecording ? "#fff" : "#64748b"} strokeWidth="2" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
            </button>
          )}

          {/* Send */}
          <button onClick={() => sendMessage()} disabled={!input.trim()}
            style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: input.trim() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e2e8f0", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#94a3b8"} strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 8, marginBottom: 0 }}>PsyBot peut faire des erreurs. En cas de crise, contactez le 3114.</p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;