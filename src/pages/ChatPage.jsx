// ChatPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConsultation, getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { Send, Video, ArrowLeft, Wifi, WifiOff, Clock, User, Stethoscope } from "lucide-react";

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
    onMessage: (msg) => setMessages((prev) => [...prev, msg]),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!consultationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-md">
          <p className="text-red-500 font-medium">Consultation introuvable (ID manquant)</p>
          <button onClick={() => navigate("/consultations")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            Retour
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [consultationRes, chatRes] = await Promise.allSettled([
          getConsultation(consultationId),
          getChatHistory(consultationId),
        ]);
        if (!isMounted) return;
        if (consultationRes.status === "fulfilled") {
          const c = consultationRes.value;
          setConsultation(c);
          if (c.statut !== "CONFIRMEE") { navigate("/consultations"); return; }
        } else { navigate("/consultations"); return; }
        if (chatRes.status === "fulfilled") setMessages(chatRes.value || []);
        else setMessages([]);
      } catch { navigate("/consultations"); }
      finally { if (isMounted) setLoading(false); }
    }
    loadData();
    return () => { isMounted = false; };
  }, [consultationId, navigate]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    sendMessage({ contenu: text, anonymat });
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Chargement de la consultation...</p>
      </div>
    </div>
  );

  const pro = consultation?.professionnel;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate("/consultations")}
          className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500">
          <ArrowLeft size={20} />
        </button>

        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow">
          {pro?.prenom?.[0]}{pro?.nom?.[0]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">
            Dr {pro?.prenom} {pro?.nom}
          </p>
          <p className="text-xs text-slate-400 truncate">{pro?.specialite} · Consultation #{consultationId}</p>
        </div>

        <div className="flex items-center gap-2">
          {consultation?.lienVisio && (
            <a href={consultation.lienVisio} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-100 transition">
              <Video size={16} />
              Visio
            </a>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${connected ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
            {connected ? "Connecté" : "Déconnecté"}
          </div>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 max-w-3xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send size={22} className="text-slate-300" />
            </div>
            <p className="text-sm">Aucun message pour le moment.</p>
            <p className="text-xs mt-1">Commencez la conversation ci-dessous.</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = m.moi; // adapter selon ton modèle
            return (
              <div key={m.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium mr-2 mt-1 flex-shrink-0">
                    {m.expediteurNom?.[0] || "?"}
                  </div>
                )}
                <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white text-slate-800 rounded-bl-md"
                }`}>
                  {!isMe && (
                    <p className="text-[11px] font-semibold text-blue-500 mb-1">
                      {m.anonymat ? "Anonyme" : m.expediteurNom}
                    </p>
                  )}
                  <p className="leading-relaxed">{m.contenu}</p>
                  {m.horodatage && (
                    <p className={`text-[10px] mt-1 ${isMe ? "text-blue-200" : "text-slate-400"}`}>
                      {new Date(m.horodatage).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 sticky bottom-0">
        {error && <p className="text-red-500 text-xs mb-2 px-1">{error}</p>}
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-400 transition">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message..."
              rows={1}
              className="w-full bg-transparent text-sm text-slate-800 resize-none outline-none placeholder-slate-400"
              style={{ maxHeight: 120, overflowY: "auto" }}
            />
            <div className="flex items-center justify-between mt-1.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 select-none">
                <input type="checkbox" checked={anonymat} onChange={e => setAnonymat(e.target.checked)}
                  className="rounded accent-blue-600" />
                Envoyer anonymement
              </label>
              <span className="text-[10px] text-slate-400">Entrée pour envoyer</span>
            </div>
          </div>
          <button onClick={handleSend}
            disabled={!inputValue.trim() || !connected}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-md active:scale-95">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}