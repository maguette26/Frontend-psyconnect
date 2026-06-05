// pages/ChatPage.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
 
import { useWebSocket } from "../hooks/useWebSocket";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { getConsultation, getChatHistory } from '../services/api';

export default function ChatPage({ currentUser }) {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [consultation, setConsultation] = useState(null);
  const [input, setInput] = useState("");
  const [anonymat, setAnonymat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Détermine l'autre participant
  const otherUserId =
    currentUser?.id === consultation?.reservation?.patient?.id
      ? consultation?.professionnel?.id
      : consultation?.reservation?.patient?.id;

  const { isOtherOnline, handleStatusChange } = useOnlineStatus(otherUserId);

  const handleNewMessage = useCallback(
    (msg) => {
      setMessages((prev) => {
        // Évite les doublons
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (!isAtBottom && msg.expediteurId !== currentUser?.id) {
        setUnreadCount((n) => n + 1);
      }
    },
    [isAtBottom, currentUser?.id]
  );

  const { connected, error: wsError, sendMessage } = useWebSocket({
    consultationId: Number(consultationId),
    onMessage: handleNewMessage,
    onOnlineStatus: handleStatusChange,
  });

  // Chargement initial
  useEffect(() => {
  Promise.all([
    getConsultation(consultationId),
    getChatHistory(consultationId),
  ])
    .then(([consult, history]) => {
      if (consult.statut !== "CONFIRMEE") {
        setPageError("Cette consultation n'est pas active.");
        return;
      }
      setConsultation(consult);
      setMessages(history);
    })
    .catch((e) => setPageError(e.message))
    .finally(() => setLoading(false));
}, [consultationId]);
  // Auto-scroll
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setIsAtBottom(atBottom);
    if (atBottom) setUnreadCount(0);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !connected) return;
    const ok = sendMessage({ contenu: trimmed, anonymat });
    if (ok) setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return <div className="chat-loading">Chargement du chat...</div>;
  if (pageError) return (
    <div className="chat-error">
      <p>{pageError}</p>
      <button onClick={() => navigate("/consultations")}>← Retour</button>
    </div>
  );

  const otherName =
    currentUser?.id === consultation?.reservation?.patient?.id
      ? `Dr. ${consultation?.professionnel?.nom}`
      : `${consultation?.reservation?.patient?.nom}`;

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate("/consultations")}>←</button>
        <div className="chat-header-info">
          <span className="chat-other-name">{otherName}</span>
          <span className={`online-badge ${isOtherOnline ? "online" : "offline"}`}>
            {isOtherOnline ? "● En ligne" : "○ Hors ligne"}
          </span>
        </div>
        <span className={`ws-status ${connected ? "connected" : "disconnected"}`}>
          {connected ? "🟢" : "🔴"}
        </span>
      </div>

      {/* Erreur WebSocket */}
      {wsError && (
        <div className="ws-error-banner">{wsError}</div>
      )}

      {/* Messages */}
      <div
        className="messages-container"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isMine={msg.expediteurId === currentUser?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Bouton scroll + badge non-lus */}
      {!isAtBottom && (
        <button className="scroll-to-bottom" onClick={scrollToBottom}>
          ↓ {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
      )}

      {/* Zone de saisie */}
      <div className="chat-input-area">
        <label className="anonymat-toggle">
          <input
            type="checkbox"
            checked={anonymat}
            onChange={(e) => setAnonymat(e.target.checked)}
          />
          Anonyme
        </label>
        <textarea
          ref={inputRef}
          className="chat-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Votre message... (Entrée pour envoyer)"
          rows={2}
          disabled={!connected}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || !connected}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isMine }) {
  const time = msg.heure
    ? msg.heure.substring(0, 5)
    : new Date(msg.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`message-bubble ${isMine ? "mine" : "theirs"} ${msg.inapproprie ? "flagged" : ""}`}>
      {!isMine && (
        <span className="sender-name">
          {msg.anonymat ? "Anonyme" : msg.expediteurNom}
        </span>
      )}
      <p className="message-content">{msg.contenu}</p>
      <span className="message-time">{time}</span>
    </div>
  );
}