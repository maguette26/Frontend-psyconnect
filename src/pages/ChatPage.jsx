import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConsultation, getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  Send,
  Video,
  ArrowLeft,
  Wifi,
  WifiOff
} from "lucide-react";

export default function ChatPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [anonymat, setAnonymat] = useState(false);

  const messagesEndRef = useRef(null);

  const { connected, error, sendMessage } = useWebSocket({
    consultationId,
    onMessage: (msg) =>
      setMessages((prev) => [...prev, msg]),
  });

  // scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // load data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        const [consultationRes, chatRes] = await Promise.allSettled([
          getConsultation(consultationId),
          getChatHistory(consultationId),
        ]);

        if (!isMounted) return;

        // ❌ consultation obligatoire
        if (consultationRes.status !== "fulfilled") {
          console.error("Consultation 404 ou erreur");
          navigate("/consultations");
          return;
        }

        const c = consultationRes.value;
        setConsultation(c);

        // sécurité statut
        if (c.statut !== "CONFIRMEE") {
          navigate("/consultations");
          return;
        }

        // chat history (optionnel)
        if (chatRes.status === "fulfilled") {
          setMessages(chatRes.value || []);
        }

     } catch (err) {
  console.error("ChatPage error status:", err?.response?.status);
  console.error("ChatPage error message:", err?.response?.data);
  console.error("ChatPage error full:", err);
  navigate("/consultations");
}finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [consultationId, navigate]);

  // envoyer message
  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    sendMessage({
      contenu: text,
      anonymat,
    });

    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  // ❌ FIX IMPORTANT : mapping backend flat fields
  const pro = consultation
    ? {
        prenom: consultation.professionnelPrenom,
        nom: consultation.professionnelNom,
        specialite: consultation.specialite,
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* HEADER */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/consultations")}
          className="p-2 hover:bg-slate-100 rounded"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1">
          <p className="font-semibold">
            Dr {pro?.prenom} {pro?.nom}
          </p>
          <p className="text-xs text-slate-400">
            {pro?.specialite}
          </p>
        </div>

        {consultation?.lienVisio && (
          <a
            href={consultation.lienVisio}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm"
          >
            <Video size={14} /> Visio
          </a>
        )}

        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
          connected ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
        }`}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? "OK" : "OFF"}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-slate-400">
            Aucun message
          </p>
        ) : (
          messages.map((m, i) => {
            const isMe = m.moi;

            return (
              <div
                key={m.id || i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-xl max-w-xs ${
                    isMe
                      ? "bg-blue-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs text-blue-500 font-semibold">
                      {m.anonymat ? "Anonyme" : m.expediteurNom}
                    </p>
                  )}
                  <p>{m.contenu}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white border-t flex gap-2">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border rounded p-2 text-sm"
          placeholder="Écrire..."
        />

        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || !connected}
          className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}