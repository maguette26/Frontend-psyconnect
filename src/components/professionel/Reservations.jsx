import React, { useEffect, useState, useCallback } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import {
  CheckCircle, XCircle, Clock, ScanEye,
  CalendarCheck, Filter, RefreshCw, User, Wifi, WifiOff, CreditCard,
  CalendarDays, CalendarClock, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── CONFIG STATUTS ─────────────────────────────────────────────── */
const STATUTS = ['TOUS', 'EN_ATTENTE', 'EN_ATTENTE_PAIEMENT', 'PAYEE', 'REFUSE', 'ANNULEE'];

const STATUT_CONFIG = {
  EN_ATTENTE:          { label: 'En attente',    bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  bar: 'from-amber-400 to-orange-400',  icon: Clock       },
  EN_ATTENTE_PAIEMENT: { label: 'Att. paiement', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   bar: 'from-blue-400 to-indigo-400',   icon: CreditCard  },
  PAYEE:               { label: 'Payée',          bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',bar: 'from-emerald-400 to-teal-400',  icon: CheckCircle },
  REFUSE:              { label: 'Refusée',        bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',    bar: 'from-red-400 to-rose-400',      icon: XCircle     },
  ANNULEE:             { label: 'Annulée',        bg: 'bg-slate-50',   text: 'text-slate-400',   border: 'border-slate-200',  bar: 'from-slate-300 to-slate-300',   icon: XCircle     },
};

/* ─── HELPERS ────────────────────────────────────────────────────── */
const fmtDate = (d) => {
  if (!d) return '—';
  try {
    const dt = new Date(String(d) + 'T12:00:00');
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return '—'; }
};

const fmtDateShort = (d) => {
  if (!d) return '—';
  try {
    const dt = new Date(String(d) + 'T12:00:00');
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch { return '—'; }
};

const fmtHeure = (h) => {
  if (!h) return '—';
  if (typeof h === 'string') {
    const parts = h.split(':');
    return `${parts[0]}h${parts[1] || '00'}`;
  }
  if (typeof h === 'object' && 'hour' in h) {
    return `${String(h.hour).padStart(2, '0')}h${String(h.minute).padStart(2, '0')}`;
  }
  return '—';
};

/* ─── BADGE STATUT ───────────────────────────────────────────────── */
function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut];
  if (!cfg) return <span className="text-xs text-slate-400">{statut}</span>;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const cls = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error:   'bg-red-50 border-red-200 text-red-600',
    info:    'bg-blue-50 border-blue-200 text-blue-600',
  }[type] || 'bg-slate-50 border-slate-200 text-slate-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${cls}`}
    >
      {msg}
    </motion.div>
  );
}

/* ─── MODAL DÉTAILS ──────────────────────────────────────────────── */
function DetailsModal({ res, onClose }) {
  if (!res) return null;
  const cfg = STATUT_CONFIG[res.statut];
  const bar = cfg?.bar || 'from-indigo-400 to-violet-400';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

        <div className={`bg-gradient-to-r ${bar} px-6 pt-5 pb-6 text-white`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Réservation #{res.id}
            </span>
            <button onClick={onClose} className="text-white/70 hover:text-white transition">
              <XCircle size={18} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
              {`${res.utilisateur?.prenom?.[0] || ''}${res.utilisateur?.nom?.[0] || ''}`.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold text-base leading-tight">
                {res.utilisateur?.prenom} {res.utilisateur?.nom}
              </p>
              <p className="text-white/70 text-xs mt-0.5">{res.utilisateur?.email || '—'}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Statut</span>
            <StatutBadge statut={res.statut} />
          </div>
          <hr className="border-slate-100" />
          <div className="rounded-xl overflow-hidden border border-slate-100">
            <div className="bg-indigo-50 px-4 py-2 flex items-center gap-2 border-b border-slate-100">
              <CalendarDays size={13} className="text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Réservation</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="px-4 py-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-semibold text-slate-700">{fmtDate(res.dateReservation)}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Heure demande</p>
                <p className="text-sm font-semibold text-slate-700">{fmtHeure(res.heureReservation)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-100">
            <div className="bg-emerald-50 px-4 py-2 flex items-center gap-2 border-b border-slate-100">
              <CalendarClock size={13} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Consultation prévue
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="px-4 py-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-semibold text-slate-700">{fmtDate(res.dateReservation)}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Heure</p>
                <p className="text-sm font-semibold text-slate-700">{fmtHeure(res.heureConsultation)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── POPOVER DE CONFIRMATION INLINE ─────────────────────────────── */
// Apparaît directement sur la card, sans bloquer toute l'UI
function ConfirmPopover({ action, onConfirm, onCancel }) {
  const isAccept = action === 'accept';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: 0.12 }}
      className={`absolute inset-0 z-10 rounded-2xl flex items-center justify-between gap-3 px-4 py-3 ${
        isAccept
          ? 'bg-emerald-50 border border-emerald-200'
          : 'bg-red-50 border border-red-200'
      }`}
    >
      <p className={`text-xs font-semibold ${isAccept ? 'text-emerald-700' : 'text-red-600'}`}>
        {isAccept ? 'Accepter cette réservation ?' : 'Refuser cette réservation ?'}
      </p>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition active:scale-95 ${
            isAccept
              ? 'bg-emerald-500 hover:bg-emerald-600'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          Confirmer
        </button>
      </div>
    </motion.div>
  );
}

/* ─── CARD RÉSERVATION ───────────────────────────────────────────── */
function ReservationCard({ res, onAccept, onRefuse, onDetails }) {
  const [confirming, setConfirming] = useState(null); // 'accept' | 'refuse' | null
  const [pending, setPending]       = useState(false);

  const cfg = STATUT_CONFIG[res.statut];
  const bar = cfg?.bar || 'from-slate-300 to-slate-300';
  const initials = `${res.utilisateur?.prenom?.[0] || ''}${res.utilisateur?.nom?.[0] || ''}`.toUpperCase();

  const handleConfirm = async () => {
    const action = confirming; // capture avant le reset
    setConfirming(null);
    setPending(true);
    try {
      if (action === 'accept') await onAccept(res.id);
      else await onRefuse(res.id);
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Barre colorée */}
      <div className={`h-1 w-full bg-gradient-to-r ${bar}`} />

      {/* Popover de confirmation — s'affiche par dessus la card */}
      <AnimatePresence>
        {confirming && (
          <ConfirmPopover
            action={confirming}
            onConfirm={handleConfirm}
            onCancel={() => setConfirming(null)}
          />
        )}
      </AnimatePresence>

      <div className={`px-4 py-3 flex items-center gap-3 transition-opacity ${pending ? 'opacity-50 pointer-events-none' : ''}`}>

        {/* Avatar */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bar} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
          {initials || <User size={14} />}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm leading-tight truncate">
                {res.utilisateur?.prenom} {res.utilisateur?.nom}
              </p>
              <p className="text-xs text-slate-400 truncate">{res.utilisateur?.email}</p>
            </div>
            {/* Badge avec spinner si en cours */}
            {pending ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-50 text-slate-400 border-slate-200">
                <RefreshCw size={11} className="animate-spin" />
                Mise à jour…
              </span>
            ) : (
              <StatutBadge statut={res.statut} />
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <CalendarDays size={11} className="text-indigo-400 shrink-0" />
              {fmtDateShort(res.dateReservation)} — demande à {fmtHeure(res.heureReservation)}
            </span>
            {res.heureConsultation && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <CalendarClock size={11} className="shrink-0" />
                Consult. à {fmtHeure(res.heureConsultation)}
              </span>
            )}
          </div>
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="flex flex-col gap-1.5 flex-shrink-0 ml-1">
          <button
            onClick={() => onDetails(res)}
            title="Voir les détails"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 text-xs font-medium transition"
          >
            <ScanEye size={14} />
            <span>Détails</span>
          </button>

          {res.statut === 'EN_ATTENTE' && (
            <div className="flex gap-1.5">
              <button
                onClick={() => setConfirming('accept')}
                title="Accepter la réservation"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition active:scale-95 shadow-sm"
              >
                <ThumbsUp size={13} />
                <span>Accepter</span>
              </button>
              <button
                onClick={() => setConfirming('refuse')}
                title="Refuser la réservation"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition active:scale-95 shadow-sm"
              >
                <ThumbsDown size={13} />
                <span>Refuser</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── COMPOSANT PRINCIPAL ────────────────────────────────────────── */
const POLL_INTERVAL = 15000;

export default function ListeReservations({ proId }) {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter]             = useState('TOUS');
  const [selected, setSelected]         = useState(null);
  const [toast, setToast]               = useState(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [lastSync, setLastSync]         = useState(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      const data = await getReservations(proId);
      setReservations(data);
      setServerOnline(true);
      setLastSync(new Date());
    } catch (err) {
      const is5xx = [502, 503].includes(err?.response?.status);
      if (is5xx || !err?.response) setServerOnline(false);
      else setToast({ msg: 'Erreur de chargement', type: 'error' });
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [proId]);

  useEffect(() => { if (proId) load(); }, [proId, load]);
  useEffect(() => {
    if (!proId) return;
    const id = setInterval(() => load(true), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [proId, load]);

  const reservationsRef = React.useRef(reservations);
  useEffect(() => { reservationsRef.current = reservations; }, [reservations]);

  const handleUpdate = async (id, statut) => {
    const snapshot = reservationsRef.current;

    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, statut } : r)
    );

    try {
      await updateReservationStatus(id, statut);
      setToast({ msg: 'Statut mis à jour', type: 'success' });
      load(true);
    } catch (err) {
      console.error('updateReservationStatus error:', err);
      setReservations(snapshot);
      setToast({ msg: 'Erreur — modification annulée.', type: 'error' });
    }
  };

  const filtered = filter === 'TOUS'
    ? reservations
    : reservations.filter(r => r.statut === filter);

  const counts = STATUTS.reduce((acc, s) => {
    acc[s] = s === 'TOUS' ? reservations.length : reservations.filter(r => r.statut === s).length;
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Réservations</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            {serverOnline ? (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Wifi size={10} className="text-emerald-400" />
                {lastSync
                  ? `Synchro à ${lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                  : 'En ligne'}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <WifiOff size={10} />
                Serveur en veille
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => load()}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* ALERTE OFFLINE */}
      {!serverOnline && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3">
          <WifiOff size={15} className="mt-0.5 shrink-0" />
          <span>
            <strong>Serveur en veille.</strong>{' '}
            Rafraîchissement automatique toutes les {POLL_INTERVAL / 1000} s.
          </span>
        </div>
      )}

      {/* FILTRES */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUTS.map(s => {
          const cfg = STATUT_CONFIG[s];
          const active = filter === s;
          const Icon = cfg?.icon;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shrink-0 ${
                active
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-slate-700'
              }`}
            >
              {s === 'TOUS' ? <Filter size={11} /> : Icon && <Icon size={11} />}
              {s === 'TOUS' ? 'Tous' : cfg?.label || s}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {counts[s]}
              </span>
            </button>
          );
        })}
      </div>

      {/* LISTE */}
      {reservations.length === 0 && !refreshing ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <CalendarCheck size={26} className="text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500 text-sm">Aucune réservation pour le moment</p>
          <p className="text-xs text-slate-400 mt-1">Les nouvelles réservations apparaîtront ici.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-400 text-sm italic">Aucune réservation avec ce statut.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filtered.map(r => (
              <ReservationCard
                key={r.id}
                res={r}
                onAccept={id => handleUpdate(id, 'VALIDE')}
                onRefuse={id => handleUpdate(id, 'REFUSE')}
                onDetails={setSelected}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {selected && <DetailsModal res={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}