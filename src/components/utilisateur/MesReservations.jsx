import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  CalendarCheck, Clock, CreditCard, TicketCheck,
  SlidersHorizontal, XCircle, Stethoscope, Trash2, ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

const formatHeure = (heureStr) => {
  if (!heureStr) return '—';
  return heureStr.replace('H', ':').substring(0, 5);
};

const isPassee = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr + 'T00:00:00') < new Date();
};

const STATUT_CONFIG = {
  EN_ATTENTE:          { label: 'En attente',       bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
  EN_ATTENTE_PAIEMENT: { label: 'Attente paiement', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-400'  },
  PAYEE:               { label: 'Payée',             bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  ANNULEE:             { label: 'Annulée',           bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     dot: 'bg-red-400'     },
  REFUSE:              { label: 'Refusée',           bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-400'   },
};

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] || { label: statut, bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' };
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

const MesReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [statut, setStatut] = useState('');
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get('/reservations/mes-reservations')
      .then(r => setReservations(r.data))
      .catch(e => setError(e.message));
  }, []);

  // Only ANNULEE or REFUSE can be deleted
  const canDelete = (res) =>
    res.statut === 'ANNULEE' || res.statut === 'REFUSE';

  const handleDownloadTicket = async (id) => {
    try {
      const response = await api.get(`/reservations/telecharger-recu/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      Object.assign(document.createElement('a'), { href: url, download: `recu_${id}.pdf` }).click();
      toast.success('Ticket téléchargé !');
    } catch {
      toast.error('Erreur lors du téléchargement.');
    }
  };

  const handleAnnuler = async (res) => {
    try {
      await api.delete(`/reservations/annuler/${res.id}`);
      setReservations(prev => prev.filter(r => r.id !== res.id));
      setSelected(null);
      toast.success('Réservation annulée.');
    } catch {
      toast.error("Erreur lors de l'annulation.");
    }
  };

  const handleDelete = async (res) => {
     console.log("Suppression réservation ID:", res.id, "| objet complet:", res);
    setDeleting(true);
    try {
      await api.delete(`/reservations/supprimer/${res.id}`);
      setReservations(prev => prev.filter(r => r.id !== res.id));
      setConfirmDelete(null);
      setSelected(null);
      toast.success('Réservation supprimée.');
    } catch {
      toast.error('Erreur lors de la suppression.');
    } finally {
      setDeleting(false);
    }
  };

  const openConfirmDelete = (e, res) => {
    e.stopPropagation();
    setSelected(null);      // close detail modal if open
    setConfirmDelete(res);  // open confirm modal
  };

  const filtered = reservations.filter(r => statut ? r.statut === statut : r.statut !== 'ANNULEE');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <ToastContainer position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mes Réservations</h1>
          <p className="text-sm text-slate-400 mt-0.5">{filtered.length} réservation{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <SlidersHorizontal size={15} className="text-slate-400" />
          <select value={statut} onChange={e => setStatut(e.target.value)}
            className="bg-transparent text-sm text-slate-700 font-medium focus:outline-none cursor-pointer">
            <option value="">Actives</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="EN_ATTENTE_PAIEMENT">Attente paiement</option>
            <option value="PAYEE">Payées</option>
            <option value="ANNULEE">Annulées</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="text-slate-300" size={28} />
          </div>
          <p className="text-slate-500 font-medium">Aucune réservation trouvée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(res => (
              <motion.div key={res.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelected(res)}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                    <Stethoscope size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">Dr {res.professionnelNom}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Réservé le {formatDate(res.dateReservation)} · {formatHeure(res.heureReservation)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatutBadge statut={res.statut} />
                    {res.prix != null && (
                      <span className="text-sm font-semibold text-slate-600 hidden sm:block">{res.prix}€</span>
                    )}
                    {/* Trash button — only visible on hover, only for ANNULEE or REFUSE */}
                    {canDelete(res) && (
                      <button
                        onClick={(e) => openConfirmDelete(e, res)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                      >
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

      {/* ── MODAL DETAIL ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Stethoscope size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Dr {selected.professionnelNom}</p>
                    <StatutBadge statut={selected.statut} />
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-600 transition">
                  <XCircle size={22} />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-4">
                <InfoRow label="Date réservation"   value={formatDate(selected.dateReservation)} />
                <InfoRow label="Heure réservation"  value={formatHeure(selected.heureReservation)} />
                <InfoRow label="Date consultation"  value={formatDate(selected.jourConsultation)} />
                <InfoRow label="Heure consultation" value={formatHeure(selected.heureConsultation)} />
                {selected.prix != null && <InfoRow label="Prix" value={`${selected.prix} €`} />}
              </div>

              {/* Modal actions */}
              <div className="px-6 pb-6 flex flex-col gap-2">
                {selected.statut === 'PAYEE' && (
                  <button
                    onClick={() => handleDownloadTicket(selected.id)}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
                  >
                    <TicketCheck size={16} /> Télécharger le ticket
                  </button>
                )}

                {(selected.statut === 'EN_ATTENTE' || selected.statut === 'EN_ATTENTE_PAIEMENT') && (
                  <button
                    onClick={() => handleAnnuler(selected)}
                    className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
                  >
                    <XCircle size={16} /> Annuler la réservation
                  </button>
                )}

                {/* Delete button — only for ANNULEE or REFUSE */}
                {canDelete(selected) && (
                  <button
                    onClick={(e) => openConfirmDelete(e, selected)}
                    className="w-full py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 size={16} /> Supprimer la réservation
                  </button>
                )}

                <button
                  onClick={() => setSelected(null)}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-sm transition"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL CONFIRM DELETE ── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !deleting && setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Red top banner */}
              <div className="bg-red-50 px-6 pt-6 pb-5 flex flex-col items-center border-b border-red-100">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-3">
                  <AlertTriangle className="text-red-500" size={26} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 text-center">Supprimer cette réservation ?</h3>
                <p className="text-sm text-slate-500 text-center mt-1">Cette action est irréversible.</p>
              </div>

              {/* Reservation summary */}
              <div className="px-6 py-4 space-y-2">
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                  <span className="text-xs text-slate-400 font-medium">Médecin</span>
                  <span className="text-sm font-semibold text-slate-700">Dr {confirmDelete.professionnelNom}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                  <span className="text-xs text-slate-400 font-medium">Consultation</span>
                  <span className="text-sm font-semibold text-slate-700">{formatDate(confirmDelete.jourConsultation)}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                  <span className="text-xs text-slate-400 font-medium">Statut</span>
                  <StatutBadge statut={confirmDelete.statut} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleting}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Suppression…
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} /> Supprimer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MesReservations;