import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, Mic } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "bootstrap/dist/css/bootstrap.min.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  // 🎤 speech to text
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  // 🔐 auth sync
  useEffect(() => {
    const sync = () => setUserId(localStorage.getItem("userId"));
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // 💬 load chat
  useEffect(() => {
    const defaultMsg = [
      {
        sender: "bot",
        text: "Bonjour 👋 Je suis PsyBot, ton assistant bien-être.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    const saved = localStorage.getItem(`psybot_${userId || "guest"}`);
    setMessages(saved ? JSON.parse(saved) : defaultMsg);
  }, [userId]);

  // 💾 save chat
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`psybot_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // 📜 scroll auto
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 🚀 send message
 const sendMessage = async () => {
  if (!input.trim()) return;

  const userMsg = {
    sender: "user",
    text: input,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  resetTranscript();
  setIsTyping(true);

const url = `${import.meta.env.VITE_PSYBOT_URL}/api/chat`;
  console.log("URL appelée:", url);
  console.log("VITE_PSYBOT_URL:", import.meta.env.VITE_PSYBOT_URL);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg.text, userId: userId || "guest" }),
    });

    console.log("Status réponse:", res.status);
    const data = await res.json();
    console.log("Réponse data:", data);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 600);

  } catch (err) {
    console.error("Erreur fetch:", err);
    setIsTyping(false);
    // Afficher l'erreur dans le chat pour voir
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `Erreur: ${err.message}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }
};

  // 🎤 push-to-talk
  const startMic = () => {
    resetTranscript();
    setIsRecording(true);
    SpeechRecognition.startListening({ language: "fr-FR", continuous: true });
  };

  const stopMic = () => {
    setIsRecording(false);
    SpeechRecognition.stopListening();
  };

  if (!browserSupportsSpeechRecognition) return <p>Micro non supporté</p>;

  return (
    <div style={styles.page}>
{/* HEADER PSYBOT STYLE ORIGINAL (BEAU + CLEAN) */}
<div
  className="text-center my-4 d-flex flex-column align-items-center gap-1"
  style={{ paddingTop: 10 }}
>
  <div className="d-flex justify-content-center align-items-center gap-2">
    <Bot size={28} className="text-primary" />
    <h4 className="fw-bold mb-0">PsyBot</h4>
    <Bot size={28} className="text-primary" />
  </div>

  <p
    style={{
      maxWidth: "600px",
      fontSize: "0.92rem",
      color: "#6c757d",
      lineHeight: "1.5",
      marginTop: 6,
    }}
  >
    🤖 <strong>PsyBot</strong> est ton assistant de bien-être mental.
    Il t’écoute, te soutient et t’aide à exprimer tes émotions librement.
    Tu peux lui parler à tout moment, sans jugement.
  </p>
</div>

      {/* CHAT */}
      <div style={styles.chat}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.row,
              justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.msg,
                background: m.sender === "user" ? "#1f6feb" : "#f1f1f1",
                color: m.sender === "user" ? "white" : "#111",
              }}
            >
              {m.text}
              <div style={styles.time}>{m.time}</div>
            </div>
          </div>
        ))}

        {/* 🧠 typing animation */}
        {isTyping && (
          <div style={styles.row}>
            <div style={styles.typing}>
              PsyBot est entrain d'écrire<span className="dots">...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={styles.inputBar}>
        <input
          style={styles.input}
          value={input}
          placeholder={isRecording ? "🎤 J’écoute..." : "Message..."}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        {/* MIC */}
        <button
          onMouseDown={startMic}
          onMouseUp={stopMic}
          onMouseLeave={stopMic}
          style={{
            ...styles.mic,
            background: isRecording ? "#ff4d4d" : "white",
            color: isRecording ? "white" : "#333",
          }}
        >
          <Mic size={16} />
        </button>

        {/* SEND */}
        <button onClick={sendMessage} style={styles.send}>
          <Send size={16} />
        </button>
      </div>

      {/* animation dots */}
      <style>{`
        .dots {
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;

/* ================= STYLE CHATGPT ================= */

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f7f7f8",
    fontFamily: "system-ui",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderBottom: "1px solid #e5e5e5",
    background: "white",
  },

  chat: {
    flex: 1,
    overflowY: "auto",
    maxWidth: 760,
    margin: "0 auto",
    width: "100%",
    padding: "20px 0",
  },

  row: {
    display: "flex",
    padding: "4px 16px",
  },

  msg: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.4,
  },

  time: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 4,
    textAlign: "right",
  },

  typing: {
    background: "#eee",
    padding: "8px 12px",
    borderRadius: 12,
    fontSize: 13,
  },

  inputBar: {
    display: "flex",
    gap: 8,
    padding: 10,
    maxWidth: 760,
    margin: "0 auto",
    width: "100%",
    borderTop: "1px solid #e5e5e5",
    background: "white",
  },

  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #ddd",
    fontSize: 14,
    outline: "none",
  },

  mic: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "1px solid #ddd",
  },

  send: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#1f6feb",
    border: "none",
    color: "white",
  },
}; 