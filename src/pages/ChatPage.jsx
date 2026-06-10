import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { Send, Video, ArrowLeft, Wifi, WifiOff } from "lucide-react";

export default function ChatPage() {
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

  const { connected, sendMessage } = useWebSocket({
    consultationId,
    onMessage: (msg) => setMessages((prev) => [...prev, msg]),
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
          navigate("/consultations");
          return;
        }

        if (consultationFromState.statut !== "CONFIRMEE") {
          navigate("/consultations");
          return;
        }

        const chatRes = await getChatHistory(consultationId).catch(() => []);
        if (isMounted) {
          setMessages(chatRes || []);
        }
      } catch (err) {
        console.error("ChatPage error:", err);
        if (isMounted) {
          navigate("/consultations");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [consultationId]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Consultation introuvable.</div>
      </div>
    );
  }

  const pro = {
    prenom: consultation.professionnelPrenom,
    nom: consultation.professionnelNom,
    specialite: consultation.specialite,
  };

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
            Dr {pro.prenom} {pro.nom}
          </p>
          {pro.specialite && (
            <p className="text-xs text-slate-400">{pro.specialite}</p>
          )}
        </div>

        {consultation.lienVisio && (
          <a
            href={consultation.lienVisio}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm"
          >
            <Video size={14} />
            Visio
          </a>
        )}

        <div
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            connected
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-500"
          }`}
        >
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? "Connecté" : "Déconnecté"}
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-slate-400 mt-10">
            Aucun message pour l'instant.
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={m.id || i}
              className={`flex ${m.moi ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-xl max-w-xs text-sm ${
                  m.moi
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-800 shadow-sm"
                }`}
              >
                {!m.moi && (
                  <p className="text-xs text-blue-500 font-semibold mb-0.5">
                    {m.anonymat ? "Anonyme" : m.expediteurNom}
                  </p>
                )}
                <p>{m.contenu}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white border-t flex gap-2 items-end">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 border border-slate-200 rounded-xl p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Écrire un message..."
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || !connected}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl disabled:opacity-40 transition"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}