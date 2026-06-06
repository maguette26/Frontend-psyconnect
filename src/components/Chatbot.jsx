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
    if (editText.trim()) onEdit(msg.id, editText.trim());
    setEditing(false);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, maxWidth: "80%" }}>
        {!isUser && <div style={{ marginBottom: 30 }}><BotAvatar /></div>}

        <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>

          {editing ? (
            <div style={{ background: "#fff", border: "2px solid #3b82f6", borderRadius: 14, padding: 12, minWidth: 240 }}>
              <textarea
                ref={editRef}
                value={editText}
                onChange={e => {
                  setEditText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(); }
                  if (e.key === "Escape") setEditing(false);
                }}
                style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: 14, lineHeight: 1.6 }}
              />
            </div>
          ) : (
            <div style={{
              background: isUser ? "#1c1c1e" : "#f4f4f4",
              color: isUser ? "#fff" : "#111",
              padding: "11px 16px",
              borderRadius: 18,
              fontSize: 14.5,
              lineHeight: 1.65,
              whiteSpace: "pre-wrap"
            }}>
              {msg.text}
            </div>
          )}

          <span style={{ fontSize: 11, color: "#c0c0c0", marginTop: 3 }}>
            {msg.time}
          </span>

          <div style={{
            display: "flex",
            gap: 4,
            marginTop: 2,
            opacity: hovered && !editing ? 1 : 0,
            transition: "opacity 0.15s"
          }}>
            {isUser && (
              <button onClick={() => { setEditText(msg.text); setEditing(true); }}>
                Modifier
              </button>
            )}
            <button onClick={() => navigator.clipboard.writeText(msg.text)}>Copier</button>
            <button onClick={() => onDelete(msg.id)}>Supprimer</button>
          </div>
        </div>

        {isUser && <div style={{ marginBottom: 50 }}><UserAvatar /></div>}
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

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  useEffect(() => {
    const sync = () => setUserId(localStorage.getItem("userId"));
    sync();
  }, []);

  const sendMessage = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text,
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
        body: JSON.stringify({ message: text, userId: userId || "guest" }),
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
      }, 500);

    } catch {
      setIsTyping(false);
    }
  };

  const deleteMessage = (id) =>
    setMessages(prev => prev.filter(m => m.id !== id));

  const startMic = () => {
    resetTranscript();
    setIsRecording(true);
    SpeechRecognition.startListening({ language: "fr-FR", continuous: true });
  };

  const stopMic = () => {
    setIsRecording(false);
    SpeechRecognition.stopListening();
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {messages.map(m => (
          <Message
            key={m.id}
            msg={m}
            onDelete={deleteMessage}
            onEdit={() => {}}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 10
        }}>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isRecording ? "🎤 Écoute..." : "Écrire un message..."}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 14
            }}
          />

          {/* 🎤 MICRO AMÉLIORÉ */}
          {browserSupportsSpeechRecognition && (
            <button
              onMouseDown={startMic}
              onMouseUp={stopMic}
              onMouseLeave={stopMic}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
                background: isRecording ? "#ef4444" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={isRecording ? "#fff" : "#6b7280"}
                strokeWidth="2">
                <rect x="9" y="2" width="6" height="12" rx="3"/>
                <path d="M5 10a7 7 0 0 0 14 0"/>
              </svg>
            </button>
          )}

          <button
            onClick={() => sendMessage()}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#1c1c1e",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            ➤
          </button>

        </div>
      </div>
    </div>
  );
}