import React, { useEffect, useState, useCallback } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import {
  CheckCircle, XCircle, Clock, Info, Video,
  CalendarCheck, Filter, RefreshCw, User, Wifi, WifiOff, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'EN_ATTENTE_PAIEMENT', 'PAYEE', 'REFUSE', 'ANNULEE'];

const STATUT_CONFIG = {
  EN_ATTENTE:          { label: 'En attente',          bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   icon: Clock        },
  EN_ATTENTE_PAIEMENT: { label: 'Attente paiement',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    icon: CreditCard   },
  PAYEE:               { label: 'Payée',                bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle  },
  REFUSE:              { label: 'Refusée',              bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     icon: XCircle      },
  ANNULEE:             { label: 'Annulée',              bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   icon: XCircle      },
};

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut];
  if (!cfg) return <span className="text-xs text-slate-400">{statut}</span>;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

// ─── Modal détails ─────────────────────────────────────────────────
function DetailsModal({ res, onClose }) {
  if (!res) return null;

  const formatDate = (d, t) => {
    if (!d) return 'N/A';
    try {
      const dt = new Date(`${d}T${t || '00:00'}:00`);
      return dt.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return `${d} ${t || ''}`; }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle mobile */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">Réservation #{res.id}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1">
            <XCircle size={22} />
          </button>
        </div>

        <div className="space-y-2">
          {/* Infos patient */}
          {[
            { label: 'Patient', value: `${res.utilisateur?.prenom || ''} ${res.utilisateur?.nom || ''}` },
            { label: 'Email',   value: res.utilisateur?.email || 'N/A' },
            { label: 'Statut',  value: <StatutBadge statut={res.statut} /> },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <div className="font-medium text-slate-700 text-sm">{value}</div>
            </div>
          ))}

          {/* Date de réservation */}
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400 mb-0.5">Date de réservation</p>
            <div className="font-medium text-slate-700 text-sm">
              {formatDate(res.dateReservation, res.heureDebut)}
            </div>
          </div>

          {/* Consultation */}
          {res.consultation ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 space-y-1">
              <p className="text-xs text-emerald-500 mb-1 font-semibold uppercase tracking-wide">
                Consultation prévue
              </p>
              <p className="text-xs text-slate-500">Jour</p>
              <p className="text-sm font-medium text-slate-700">
                {res.consultation.dateConsultation
                  ? new Date(res.consultation.dateConsultation).toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })
                  : 'N/A'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Heure</p>
              <p className="text-sm font-medium text-slate-700">
                {res.consultation.heure || 'N/A'}
              </p>
              
                
              
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-400 mb-0.5">Consultation</p>
              <p className="text-sm text-slate-400 italic">Aucune consultation associée.</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
        >
          Fermer
        </button>
      </motion.div>
    </div>
  );
}

// ─── Card réservation ──────────────────────────────────────────────
function ReservationCard({ res, onAccept, onRefuse, onDetails }) {
  const formatDate = (dateString, timeString) => {
    if (!dateString) return 'N/A';
    try {
      const dt = new Date(`${dateString}T${timeString || '00:00'}:00`);
      return dt.toLocaleDateString('fr-FR', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return `${dateString} ${timeString || ''}`; }
  };

  const initials = `${res.utilisateur?.prenom?.[0] || ''}${res.utilisateur?.nom?.[0] || ''}`.toUpperCase();

  const barColor =
    res.statut === 'PAYEE'               ? 'bg-emerald-400' :
    res.statut === 'EN_ATTENTE'          ? 'bg-amber-400'   :
    res.statut === 'EN_ATTENTE_PAIEMENT' ? 'bg-blue-400'    :
    res.statut === 'ANNULEE'             ? 'bg-slate-300'   :
    'bg-red-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className={`h-1 w-full ${barColor}`} />

      <div className="p-4">
        {/* HEADER */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
            {initials || <User size={16} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">
                  {res.utilisateur?.prenom} {res.utilisateur?.nom}
                </h3>
                <p className="text-xs text-slate-400 truncate">{res.utilisateur?.email}</p>
              </div>
              <StatutBadge statut={res.statut} />
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarCheck size={12} className="text-indigo-400 shrink-0" />
              <span className="truncate">{formatDate(res.dateReservation, res.dateReservation)}</span>
              <span className="text-slate-300 ml-1">#{res.id}</span>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5">
            {res.statut === 'EN_ATTENTE' && (
              <>
                <button
                  onClick={() => onAccept(res.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition active:scale-95"
                >
                  <CheckCircle size={12} />
                  <span className="hidden sm:inline">Accepter</span>
                  <span className="sm:hidden">✓</span>
                </button>
                <button
                  onClick={() => onRefuse(res.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition active:scale-95"
                >
                  <XCircle size={12} />
                  <span className="hidden sm:inline">Refuser</span>
                  <span className="sm:hidden">✕</span>
                </button>
              </>
            )}
            {/* Un seul bouton Détails */}
            <button
              onClick={() => onDetails(res)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition"
            >
              <Info size={12} />
              Détails
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Composant principal ───────────────────────────────────────────
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
      const is503 = err?.response?.status === 503 || err?.response?.status === 502;
      const isNet = !err?.response;
      if (is503 || isNet) {
        setServerOnline(false);
      } else {
        setError('Erreur lors du chargement des réservations.');
      }
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
      setError('Erreur lors de la mise à jour. Le serveur est peut-être en veille, réessayez.');
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
    <div className="space-y-4 max-w-2xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-800">Réservations</h2>
          {!serverOnline && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
              <WifiOff size={11} />
              Serveur en veille
            </span>
          )}
          {serverOnline && lastUpdate && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Wifi size={11} />
              Synchro {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <button
          onClick={() => chargerReservations()}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {!serverOnline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
          <WifiOff size={16} className="shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Serveur en veille.</strong>
            {' '}  Rafraîchissement automatique toutes les {POLL_INTERVAL / 1000}s.
          </div>
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
          return (
            <button key={s} onClick={() => setFiltreStatut(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shrink-0 ${
                active
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}>
              {s === 'TOUS' ? <Filter size={11} /> : cfg && <cfg.icon size={11} />}
              {s === 'TOUS' ? 'Tous' : cfg?.label || s}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                {counts[s]}
              </span>
            </button>
          );
        })}
      </div>

      {/* LISTE */}
      {reservations.length === 0 && !refreshing ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <CalendarCheck className="text-slate-200 mx-auto mb-3" size={40} />
          <p className="text-slate-500 font-medium">Aucune réservation pour le moment.</p>
          <p className="text-xs text-slate-400 mt-1">Les réservations apparaîtront ici.</p>
        </div>
      ) : reservationsFiltrees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-400 italic text-sm">Aucune réservation avec ce statut.</p>
        </div>
      ) : (
        <div className="space-y-3">
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
        {selectedRes && <DetailsModal res={selectedRes} onClose={() => setSelectedRes(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default ListeReservations;