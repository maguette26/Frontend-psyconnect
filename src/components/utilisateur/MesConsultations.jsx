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
    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 sm:py-3 border-b border-slate-100 last:border-0">
      <span className="text-xs sm:text-sm text-slate-400 shrink-0">{label}</span>
      <span className="text-xs sm:text-sm font-semibold text-slate-700 text-right break-words">{value}</span>
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
      .then(r => {
        console.log("MES CONSULTATIONS DATA:", r.data);
        setConsultations(r.data);
      })
      .catch(e => setError(e.message));
  }, []);

  const handleSupprimer = async (c) => {
    console.log("Suppression consultation ID:", c.id, "| objet complet:", c);
    try {
      await api.delete(`/consultations/supprimer/${c.id}`);
      setConsultations(prev => prev.filter(x => x.id !== c.id));
      setConfirmDelete(null);
      setSelected(null);
      toast.success('Consultation supprimée.');
    } catch { toast.error('Erreur lors de la suppression.'); }
  };

  // ✅ Récupère le nom du professionnel depuis les bons champs
  const ouvrirChat = (c) => {
    console.log("CONSULTATION COMPLETE:", c); // pour vérifier les champs dispo

    navigate(`/chat/${c.id}`, {
      state: {
        consultation: {
          ...c,
          // On tente tous les noms de champs possibles selon ce que l'API renvoie
          professionnelPrenom: c.professionnelPrenom ?? c.praticienPrenom ?? c.medecinPrenom ?? c.proPrenom ?? '',
          professionnelNom:    c.professionnelNom    ?? c.praticienNom    ?? c.medecinNom    ?? c.proNom    ?? '',
          jourConsultation:    c.date,
          heureConsultation:   c.heure,
        }
      }
    });
  };

  const filtered = consultations.filter(c => statut ? c.statut === statut : true);

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8 box-border" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <ToastContainer position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Mes Consultations</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{filtered.length} consultation{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm w-full sm:w-auto">
          <SlidersHorizontal size={15} className="text-slate-400 shrink-0" />
          <select value={statut} onChange={e => setStatut(e.target.value)}
            className="bg-transparent text-sm text-slate-700 font-medium focus:outline-none cursor-pointer w-full sm:w-auto min-w-0">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRMEE">Confirmée</option>
            <option value="TERMINEE">Terminée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6 break-words">{error}</div>}

      {filtered.length === 0 ? (
        <div className="text-center py-14 sm:py-20 bg-white rounded-2xl border border-slate-100 px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="text-slate-300" size={26} />
          </div>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Aucune consultation trouvée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(c => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
                onClick={() => setSelected(c)}>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                    <Stethoscope size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-sm sm:text-base">
                      Dr {c.professionnelPrenom ?? c.praticienPrenom ?? c.medecinPrenom ?? ''}{' '}
                         {c.professionnelNom    ?? c.praticienNom    ?? c.medecinNom    ?? ''}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">{formatDate(c.date)} · {formatHeure(c.heure)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
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
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition sm:opacity-0 sm:group-hover:opacity-100">
                        <Trash2 size={15} />
                      </button>
                    )}
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition hidden sm:block" />
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
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4 pb-0 sm:pb-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Stethoscope size={18} className="text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate text-sm sm:text-base">
                      Dr {selected.professionnelPrenom ?? selected.praticienPrenom ?? selected.medecinPrenom ?? ''}{' '}
                         {selected.professionnelNom    ?? selected.praticienNom    ?? selected.medecinNom    ?? ''}
                    </p>
                    <StatutBadge statut={selected.statut} />
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-600 transition shrink-0">
                  <XCircle size={22} />
                </button>
              </div>
              <div className="px-5 sm:px-6 py-4">
                <InfoRow label="Date" value={formatDate(selected.date)} />
                <InfoRow label="Heure" value={formatHeure(selected.heure)} />
                {selected.prix != null && <InfoRow label="Prix" value={`${selected.prix} €`} />}
              </div>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col gap-2">
                {selected.statut === 'CONFIRMEE' && (
                  <button
                    onClick={() => { setSelected(null); ouvrirChat(selected); }}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition">
                    <MessageSquare size={16} /> Ouvrir le chat
                  </button>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 text-center"
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="text-red-500" size={20} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-sm sm:text-base">Supprimer cette consultation ?</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-5 break-words">
                Dr {confirmDelete.professionnelPrenom ?? confirmDelete.praticienPrenom ?? ''}{' '}
                   {confirmDelete.professionnelNom    ?? confirmDelete.praticienNom    ?? ''}{' '}
                · {formatDate(confirmDelete.date)}
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