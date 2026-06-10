// ConsultationsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConsultations } from "../services/api";
import {
  MessageCircle, Calendar, Clock, CreditCard,
  Stethoscope, User, CheckCircle, XCircle, AlertCircle, Video
} from "lucide-react";

const STATUT_CONFIG = {
  CONFIRMEE:   { label: "Confirmée",   bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle  },
  EN_ATTENTE:  { label: "En attente",  bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",   icon: AlertCircle  },
  ANNULEE:     { label: "Annulée",     bg: "bg-red-50",      text: "text-red-600",     border: "border-red-200",     icon: XCircle      },
  TERMINEE:    { label: "Terminée",    bg: "bg-slate-50",    text: "text-slate-500",   border: "border-slate-200",   icon: CheckCircle  },
};

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] || STATUT_CONFIG.EN_ATTENTE;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

function ConsultationCard({ c, onChat }) {
  const pro = c.professionnel;
  const [expanded, setExpanded] = useState(false);

  const dateFormatee = c.dateConsultation
    ? new Date(c.dateConsultation).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* CARD HEADER */}
      <div className="p-5 flex items-start gap-4">
        {/* Avatar pro */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow flex-shrink-0">
          {pro?.prenom?.[0]}{pro?.nom?.[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-slate-800 text-base leading-tight">
                Dr {pro?.prenom} {pro?.nom}
              </h3>
              <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
                <Stethoscope size={13} />
                {pro?.specialite || "Spécialiste"}
              </p>
            </div>
            <StatutBadge statut={c.statut} />
          </div>

          {/* Infos principales */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
            {dateFormatee && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-400" />
                {dateFormatee}
              </span>
            )}
            {c.heure && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-blue-400" />
                {c.heure}
              </span>
            )}
            {c.prix != null && (
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <CreditCard size={14} className="text-blue-400" />
                {c.prix} MAD
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DÉTAILS EXPANDABLES */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {pro?.email && (
              <div className="bg-slate-50 rounded-xl px-3 py-2">
                <p className="text-xs text-slate-400 mb-0.5">Email du praticien</p>
                <p className="font-medium text-slate-700 truncate">{pro.email}</p>
              </div>
            )}
            {pro?.telephone && (
              <div className="bg-slate-50 rounded-xl px-3 py-2">
                <p className="text-xs text-slate-400 mb-0.5">Téléphone</p>
                <p className="font-medium text-slate-700">{pro.telephone}</p>
              </div>
            )}
            {c.motif && (
              <div className="bg-slate-50 rounded-xl px-3 py-2 sm:col-span-2">
                <p className="text-xs text-slate-400 mb-0.5">Motif de consultation</p>
                <p className="font-medium text-slate-700">{c.motif}</p>
              </div>
            )}
            {c.notes && (
              <div className="bg-blue-50 rounded-xl px-3 py-2 sm:col-span-2">
                <p className="text-xs text-blue-400 mb-0.5">Notes</p>
                <p className="text-slate-700">{c.notes}</p>
              </div>
            )}
          </div>

          {c.lienVisio && (
            <a href={c.lienVisio} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition w-fit">
              <Video size={16} />
              Rejoindre la visio
            </a>
          )}
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <button onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition">
          {expanded ? "Masquer les détails" : "Voir les détails"}
        </button>

        {c.statut === "CONFIRMEE" && (
          <button onClick={() => onChat(c.idConsultation)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition shadow-sm active:scale-95">
            <MessageCircle size={15} />
            Ouvrir le chat
          </button>
        )}
      </div>
    </div>
  );
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getConsultations()
      .then(setConsultations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Chargement des consultations...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow">
        <XCircle className="text-red-400 mx-auto mb-3" size={36} />
        <p className="text-slate-700 font-medium">{error}</p>
      </div>
    </div>
  );

  const confirmees = consultations.filter(c => c.statut === "CONFIRMEE");
  const autres = consultations.filter(c => c.statut !== "CONFIRMEE");

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="max-w-2xl mx-auto">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Mes Consultations</h1>
          <p className="text-slate-400 text-sm mt-1">
            {consultations.length} consultation{consultations.length > 1 ? "s" : ""} au total
          </p>
        </div>

        {consultations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-slate-300" size={28} />
            </div>
            <p className="font-medium text-slate-600">Aucune consultation trouvée</p>
            <p className="text-slate-400 text-sm mt-1">Vos consultations apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {confirmees.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
                  Consultations confirmées
                </h2>
                <div className="space-y-3">
                  {confirmees.map(c => (
                    <ConsultationCard key={c.idConsultation} c={c}  onChat={(c) => navigate(`/chat/${c.idConsultation}`, {
  state: { consultation: c }
})} />
                  ))}
                </div>
              </section>
            )}

            {autres.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
                  Autres consultations
                </h2>
                <div className="space-y-3">
                  {autres.map(c => (
                    <ConsultationCard key={c.idConsultation} c={c} onChat={(c) => navigate(`/chat/${c.idConsultation}`, {
  state: { consultation: c }
})} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}