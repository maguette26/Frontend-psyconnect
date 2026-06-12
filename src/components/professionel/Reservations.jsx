import React, { useEffect, useState, useCallback } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import {
  CheckCircle, XCircle, Clock, Info,
  CalendarCheck, Filter, RefreshCw, User, Wifi, WifiOff, CreditCard,
  CalendarDays, CalendarClock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'EN_ATTENTE_PAIEMENT', 'PAYEE', 'REFUSE', 'ANNULEE'];

const STATUT_CONFIG = {
  EN_ATTENTE:          { label: 'En attente',       bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400',    icon: Clock        },
  EN_ATTENTE_PAIEMENT: { label: 'Att. paiement',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400',     icon: CreditCard   },
  PAYEE:               { label: 'Payée',             bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400',  icon: CheckCircle  },
  REFUSE:              { label: 'Refusée',           bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     dot: 'bg-red-400',      icon: XCircle      },
  ANNULEE:             { label: 'Annulée',           bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-300',    icon: XCircle      },
};

// ─── Helpers ────────────────────────────────────────────────────────
const formatDateLong = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return dateStr; }
};

const formatDateTime = (dateStr, timeStr) => {
  if (!dateStr) return 'N/A';
  try {
    const dt = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
    return dt.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return `${dateStr} ${timeStr || ''}`; }
};

// ─── Badge statut ────────────────────────────────────────────────────
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

// ─── Ligne info dans le modal ────────────────────────────────────────
function InfoRow({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="text-sm font-medium text-slate-700">{children}</div>
    </div>
  );
}

// ─── Modal détails ───────────────────────────────────────────────────
function DetailsModal({ res, onClose }) {
  if (!res) return null;

  const hasConsultation = !!res.consultation;

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
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Barre mobile */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

        {/* En-tête coloré */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center font-bold text-base">
                {`${res.utilisateur?.prenom?.[0] || ''}${res.utilisateur?.nom?.[0] || ''}`.toUpperCase() || <User size={18} />}
              </div>
              <div>
                <p className="font-semibold text-base leading-tight">
                  {res.utilisateur?.prenom} {res.utilisateur?.nom}
                </p>
                <p className="text-indigo-200 text-xs">{res.utilisateur?.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition p-1">
              <XCircle size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Statut */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Statut</span>
            <StatutBadge statut={res.statut} />
          </div>

          <hr className="border-slate-100" />

          {/* Réservation */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                <CalendarDays size={13} className="text-indigo-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Réservation</span>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3 grid grid-cols-2 gap-4">
              <InfoRow label="Date">
                {formatDateLong(res.dateReservation)}
              </InfoRow>
              <InfoRow label="Heure">
                {res.heureDebut || 'N/A'}
              </InfoRow>
            </div>
          </div>

          {/* Consultation */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${hasConsultation ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                <CalendarClock size={13} className={hasConsultation ? 'text-emerald-600' : 'text-slate-400'} />
              </div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Consultation prévue</span>
            </div>

            {hasConsultation ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 grid grid-cols-2 gap-4">
                <InfoRow label="Date">
                  {formatDateLong(res.consultation.dateConsultation)}
                </InfoRow>
                <InfoRow label="Heure">
                  {res.consultation.heure || 'N/A'}
                </InfoRow>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-sm text-slate-400 italic">Aucune consultation associée.</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Card réservation ─────────────────────────────────────────────
function ReservationCard({ res, onAccept, onRefuse, onDetails }) {
  const cfg = STATUT_CONFIG[res.statut];
  const initials = `${res.utilisateur?.prenom?.[0] || ''}${res.utilisateur?.nom?.[0] || ''}`.toUpperCase();

  const accentColor =
    res.statut === 'PAYEE'               ? 'from-emerald-400 to-teal-400'    :
    res.statut === 'EN_ATTENTE'          ? 'from-amber-400 to-orange-400'    :
    res.statut === 'EN_ATTENTE_PAIEMENT' ? 'from-blue-400 to-indigo-400'     :
    res.statut === 'ANNULEE'             ? 'from-slate-300 to-slate-300'     :
    'from-red-400 to-rose-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group"
    >
      {/* Barre de couleur top */}
      <div className={`h-1 w-full bg-gradient-to-r ${accentColor}`} />

      <div className="p-4 flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
          {initials || <User size={15} />}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">
                {res.utilisateur?.prenom} {res.utilisateur?.nom}
              </h3>
              <p className="text-xs text-slate-400 truncate">{res.utilisateur?.email}</p>
            </div>
            <StatutBadge statut={res.statut} />
          </div>

          {/* Dates réservation + consultation */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <CalendarDays size={11} className="text-indigo-400 shrink-0" />
              Réservé le {formatDateTime(res.dateReservation, res.heureDebut)}
            </span>
            {res.consultation && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CalendarClock size={11} className="shrink-0" />
                Consultation : {formatDateLong(res.consultation.dateConsultation)}
                {res.consultation.heure ? ` à ${res.consultation.heure}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          {res.statut === 'EN_ATTENTE' && (
            <>
              <button
                onClick={() => onAccept(res.id)}
                title="Accepter"
                className="w-8 h-8 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition active:scale-90 shadow-sm"
              >
                <CheckCircle size={15} />
              </button>
              <button
                onClick={() => onRefuse(res.id)}
                title="Refuser"
                className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl transition active:scale-90 shadow-sm"
              >
                <XCircle size={15} />
              </button>
            </>
          )}
          <button
            onClick={() => onDetails(res)}
            title="Détails"
            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition"
          >
            <Info size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Composant principal ──────────────────────────────────────────
const POLL_INTERVAL = 15000;

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [error, setError]               = useState('');
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selectedRes, setSelectedRes]   = useState(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [lastUpdate, setLastUpdate]     = useState(null);

  const chargerReservations = useCallback(async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      const data = await getReservations(proId);
      setReservations(data);
      setError('');
      setServerOnline(true);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
      const is5xx = [502, 503].includes(err?.response?.status);
      const isNet = !err?.response;
      if (is5xx || isNet) setServerOnline(false);
      else setError('Erreur lors du chargement des réservations.');
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [proId]);

  useEffect(() => {
    if (proId) chargerReservations();
  }, [proId, chargerReservations]);

  useEffect(() => {
    if (!proId) return;
    const id = setInterval(() => chargerReservations(true), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [proId, chargerReservations]);

  const handleUpdate = async (id, status) => {
    const label = status === 'VALIDE' ? "l'acceptation" : 'le refus';
    if (!window.confirm(`Confirmer ${label} de cette réservation ?`)) return;
    try {
      await updateReservationStatus(id, status);
      await chargerReservations();
    } catch {
      setError('Erreur lors de la mise à jour. Réessayez dans quelques instants.');
    }
  };

  const reservationsFiltrees = filtreStatut === 'TOUS'
    ? reservations
    : reservations.filter(r => r.statut === filtreStatut);

  const counts = STATUTS.reduce((acc, s) => {
    acc[s] = s === 'TOUS' ? reservations.length : reservations.filter(r => r.statut === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Réservations</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            {serverOnline ? (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Wifi size={10} className="text-emerald-400" />
                {lastUpdate
                  ? `Sync ${lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
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
          onClick={() => chargerReservations()}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-60 shadow-sm"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* ALERTE SERVEUR */}
      {!serverOnline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
          <WifiOff size={15} className="shrink-0 mt-0.5" />
          <span>
            <strong>Serveur en veille.</strong>{' '}
            Rafraîchissement automatique toutes les {POLL_INTERVAL / 1000} s.
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* FILTRES */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {STATUTS.map(s => {
          const cfg = STATUT_CONFIG[s];
          const active = filtreStatut === s;
          const Icon = cfg?.icon;
          return (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
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
            <CalendarCheck className="text-slate-300" size={26} />
          </div>
          <p className="text-slate-500 font-semibold text-sm">Aucune réservation pour le moment</p>
          <p className="text-xs text-slate-400 mt-1">Les nouvelles réservations apparaîtront ici.</p>
        </div>
      ) : reservationsFiltrees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-400 text-sm italic">Aucune réservation avec ce statut.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {reservationsFiltrees.map(res => (
              <ReservationCard
                key={res.id}
                res={res}
                onAccept={id => handleUpdate(id, 'VALIDE')}
                onRefuse={id => handleUpdate(id, 'REFUSE')}
                onDetails={setSelectedRes}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {selectedRes && (
          <DetailsModal res={selectedRes} onClose={() => setSelectedRes(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListeReservations;