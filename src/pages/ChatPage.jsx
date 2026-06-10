import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getChatHistory } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  Send, Video, ArrowLeft, Wifi, WifiOff,
  Clock, CheckCircle, MessageCircle
} from "lucide-react";

// Vérifie si la consultation a commencé
const isConsultationStarted = (consultation) => {
  if (!consultation) return false;
  const dateStr = consultation.jourConsultation || consultation.dateConsultation;
  const heureStr = consultation.heureConsultation;
  if (!dateStr || !heureStr) return true;

  try {
    const heure = heureStr.replace("H", ":").substring(0, 5);
    const dt = new Date(`${dateStr}T${heure}:00`);
    return new Date() >= dt;
  } catch {
    return true;
  }
};

const isConsultationTerminee = (consultation) => {
  if (!consultation) return false;
  return consultation.statut === "TERMINEE" || consultation.statut === "ANNULEE";
};

function StatusScreen({ icon: Icon, color, title, subtitle, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl transition"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <p className="font-semibold text-slate-700">Consultation</p>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center mx-auto mb-5 shadow-md`}>
            <Icon size={36} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{subtitle}</p>
          <button
            onClick={onBack}
            className="mt-6 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm"
          >
            Retour aux consultations
          </button>
        </div>
      </div>
    </div>
  );
}

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

        if (
          consultationFromState.statut !== "CONFIRMEE" &&
          consultationFromState.statut !== "TERMINEE"
        ) {
          navigate("/consultations");
          return;
        }

        const chatRes = await getChatHistory(consultationId).catch(() => []);
        if (isMounted) {
          setMessages(chatRes || []);
        }
      } catch (err) {
        console.error("ChatPage error:", err);
        if (isMounted) navigate("/consultations");
      } finally {
        if (isMounted) setLoading(false);
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Consultation introuvable.</p>
      </div>
    );
  }

  // Consultation terminée ou annulée
  if (isConsultationTerminee(consultation)) {
    return (
      <StatusScreen
        icon={CheckCircle}
        color="bg-emerald-500"
        title="Consultation terminée"
        subtitle="Cette consultation est terminée. Le chat n'est plus disponible. Vous pouvez consulter vos autres consultations."
        onBack={() => navigate("/consultations")}
      />
    );
  }

  // Consultation pas encore commencée
  if (!isConsultationStarted(consultation)) {
    const dateStr = consultation.jourConsultation || consultation.dateConsultation;
    const heureStr = consultation.heureConsultation?.replace("H", "h") || "";
    const dateFormatee = dateStr
      ? new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : "";

    return (
      <StatusScreen
        icon={Clock}
        color="bg-amber-500"
        title="Pas encore commencée"
        subtitle={`Cette consultation n'a pas encore débuté. Elle est prévue le ${dateFormatee} à ${heureStr}. Revenez à ce moment-là pour accéder au chat.`}
        onBack={() => navigate("/consultations")}
      />
    );
  }

  const pro = {
    prenom: consultation.professionnelPrenom,
    nom: consultation.professionnelNom,
    specialite: consultation.specialite,
  };

  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* HEADER */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate("/consultations")}
          className="p-2 hover:bg-slate-100 rounded-xl transition"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
          {pro.prenom?.[0]}
          {pro.nom?.[0]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">
            Dr {pro.prenom} {pro.nom}
          </p>
          {pro.specialite && (
            <p className="text-xs text-slate-400 truncate">{pro.specialite}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {consultation.lienVisio && (
            <a
              href={consultation.lienVisio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold transition"
            >
              <Video size={13} />
              Visio
            </a>
          )}

          <div
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl font-medium ${
              connected
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-500"
            }`}
          >
            {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {connected ? "En ligne" : "Hors ligne"}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 gap-3">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <MessageCircle size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">Aucun message pour l'instant.</p>
            <p className="text-slate-300 text-xs">
              Commencez la conversation ci-dessous.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={m.id || i}
              className={`flex ${m.moi ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${
                  m.moi ? "items-end" : "items-start"
                }`}
              >
                {!m.moi && (
                  <p className="text-xs text-slate-400 font-medium px-1">
                    {m.anonymat ? "Anonyme" : m.expediteurNom}
                  </p>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.moi
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 shadow-sm rounded-bl-sm"
                  }`}
                >
                  {m.contenu}
                </div>
                {m.heure && (
                  <p className="text-[10px] text-slate-300 px-1">{m.heure}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="px-4 py-3 bg-white border-t shadow-sm">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 border border-slate-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-slate-50 transition"
            placeholder="Écrire un message... (Entrée pour envoyer)"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !connected}
            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 transition active:scale-95 shadow-sm flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        {!connected && (
          <p className="text-center text-xs text-red-400 mt-2">
            Connexion au chat perdue — tentative de reconnexion...
          </p>
        )}
      </div>
    </div>
  );
}