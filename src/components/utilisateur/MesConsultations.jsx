import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  CalendarCheck, Clock, CreditCard, MessageSquare,
  SlidersHorizontal, Stethoscope, XCircle, Trash2, ChevronRight, Video
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};
const formatHeure = (h) => h ? h.replace('H', ':').substring(0, 5) : '—';
const isPassee = (d) => d ? new Date(d + 'T00:00:00') < new Date() : false;

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
  CONFIRMEE:  { label: 'Confirmée',  bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
  TERMINEE:   { label: 'Terminée',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  ANNULEE:    { label: 'Annulée',    bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     dot: 'bg-red-400'     },
};

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] || { label: statut, bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-300' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}

const MesConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [statut, setStatut] = useState('');
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/consultations/mes-consultations')
      .then(r => setConsultations(r.data))
      .catch(e => setError(e.message));
  }, []);

  const handleSupprimer = async (c) => {
    try {
      await api.delete(`/consultations/supprimer/${c.id}`);
      setConsultations(prev => prev.filter(x => x.id !== c.id));
      setConfirmDelete(null);
      setSelected(null);
      toast.success('Consultation supprimée.');
    } catch { toast.error('Erreur lors de la suppression.'); }
  };

  // ✅ Helper pour naviguer vers le chat avec le state complet
  const ouvrirChat = (c) => {
  navigate(`/chat/${c.id}`, {
    state: {
      consultation: {
        ...c,
        professionnelPrenom: c.professionnelPrenom,
        professionnelNom: c.professionnelNom,
        jourConsultation: c.date,
        heureConsultation: c.heure,
      }
    }
  });
};

  const filtered = consultations.filter(c => statut ? c.statut === statut : true);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <ToastContainer position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mes Consultations</h1>
          <p className="text-sm text-slate-400 mt-0.5">{filtered.length} consultation{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <SlidersHorizontal size={15} className="text-slate-400" />
          <select value={statut} onChange={e => setStatut(e.target.value)}
            className="bg-transparent text-sm text-slate-700 font-medium focus:outline-none cursor-pointer">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRMEE">Confirmée</option>
            <option value="TERMINEE">Terminée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>}

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="text-slate-300" size={28} />
          </div>
          <p className="text-slate-500 font-medium">Aucune consultation trouvée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(c => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelected(c)}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                    <Stethoscope size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">Dr {c.professionnelPrenom} {c.professionnelNom}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(c.date)} · {formatHeure(c.heure)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatutBadge statut={c.statut} />
                    {c.statut === 'CONFIRMEE' && (
                      <button
                        onClick={e => { e.stopPropagation(); ouvrirChat(c); }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition">
                        <MessageSquare size={12} /> Chat
                      </button>
                    )}
                    {(isPassee(c.date) || c.statut === 'ANNULEE' || c.statut === 'TERMINEE') && (
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete(c); }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition opacity-0 group-hover:opacity-100">
                        <Trash2 size={15} />
                      </button>
                    )}
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL DETAIL */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Stethoscope size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Dr {selected.professionnelPrenom} {selected.professionnelNom}</p>
                    <StatutBadge statut={selected.statut} />
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-600 transition">
                  <XCircle size={22} />
                </button>
              </div>
              <div className="px-6 py-4">
                <InfoRow label="Date" value={formatDate(selected.date)} />
                <InfoRow label="Heure" value={formatHeure(selected.heure)} />
                {selected.prix != null && <InfoRow label="Prix" value={`${selected.prix} €`} />}
              </div>
              <div className="px-6 pb-6 flex flex-col gap-2">
                {selected.statut === 'CONFIRMEE' && (
                  // ✅ Corrigé : state complet passé au navigate
                  <button
                    onClick={() => { setSelected(null); ouvrirChat(selected); }}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition">
                    <MessageSquare size={16} /> Ouvrir le chat
                  </button>
                )}
                {selected.lienVisio && (
                  <a href={selected.lienVisio} target="_blank" rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition">
                    <Video size={16} /> Rejoindre la visio
                  </a>
                )}
                {(isPassee(selected.date) || selected.statut === 'ANNULEE' || selected.statut === 'TERMINEE') && (
                  <button onClick={() => { setConfirmDelete(selected); setSelected(null); }}
                    className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition">
                    <Trash2 size={16} /> Supprimer
                  </button>
                )}
                <button onClick={() => setSelected(null)}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-sm transition">
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="text-red-500" size={20} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">Supprimer cette consultation ?</h3>
              <p className="text-sm text-slate-400 mb-5">
                Dr {confirmDelete.professionnelPrenom} {confirmDelete.professionnelNom} · {formatDate(confirmDelete.date)}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition">
                  Annuler
                </button>
                <button onClick={() => handleSupprimer(confirmDelete)}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition">
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MesConsultations;