import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import {
  CheckCircle, XCircle, Clock, Info, Video,
  CalendarCheck, Filter, RefreshCw, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  icon: Clock        },
  VALIDE:     { label: 'Validée',    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',icon: CheckCircle  },
  REFUSE:     { label: 'Refusée',    bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',    icon: XCircle      },
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

function ReservationCard({ res, onAccept, onRefuse, onDetails }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString, timeString) => {
    if (!dateString) return 'N/A';
    try {
      const dt = new Date(`${dateString}T${timeString || '00:00'}:00`);
      return dt.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return `${dateString} ${timeString || ''}`; }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* HEADER */}
      <div className="p-5 flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
          {res.utilisateur?.prenom?.[0]}{res.utilisateur?.nom?.[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-slate-800 text-base leading-tight">
                {res.utilisateur?.prenom} {res.utilisateur?.nom}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                <User size={11} />
                {res.utilisateur?.email}
              </p>
            </div>
            <StatutBadge statut={res.statut} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <CalendarCheck size={13} className="text-indigo-400" />
              {formatDate(res.dateReservation, res.heureDebut)}
            </span>
            <span className="text-xs text-slate-400">#{res.id}</span>
          </div>
        </div>
      </div>

      {/* DETAILS EXPANDABLES */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-slate-100 pt-4 space-y-3">
              {res.statut === 'VALIDE' && res.consultation ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 space-y-2">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Consultation confirmée</p>
                  <p className="text-sm text-slate-700 flex items-center gap-2">
                    <CalendarCheck size={14} className="text-emerald-500" />
                    {formatDate(res.consultation.dateConsultation, res.consultation.heure)}
                  </p>
                  {res.consultation.lienVisio && (
                    <a href={res.consultation.lienVisio} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition">
                      <Video size={14} />
                      Rejoindre la visio
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Aucune consultation associée.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => setExpanded(!expanded)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
          {expanded ? 'Masquer' : 'Voir détails'}
        </button>

        <div className="flex items-center gap-2">
          {res.statut === 'EN_ATTENTE' && (
            <>
              <button onClick={() => onAccept(res.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm">
                <CheckCircle size={13} />
                Accepter
              </button>
              <button onClick={() => onRefuse(res.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm">
                <XCircle size={13} />
                Refuser
              </button>
            </>
          )}
          <button onClick={() => onDetails(res)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition">
            <Info size={13} />
            Détails
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Modal détails
function DetailsModal({ res, onClose }) {
  if (!res) return null;
  const formatDate = (d, t) => {
    if (!d) return 'N/A';
    try {
      const dt = new Date(`${d}T${t || '00:00'}:00`);
      return dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return `${d} ${t || ''}`; }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">Détails réservation #{res.id}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <XCircle size={22} />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Patient', value: `${res.utilisateur?.prenom} ${res.utilisateur?.nom}` },
            { label: 'Email', value: res.utilisateur?.email },
            { label: 'Date réservation', value: formatDate(res.dateReservation, res.heureDebut) },
            { label: 'Statut', value: <StatutBadge statut={res.statut} /> },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <div className="font-medium text-slate-700 text-sm">{value}</div>
            </div>
          ))}

          {res.statut === 'VALIDE' && res.consultation && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <p className="text-xs text-emerald-500 mb-1 font-semibold uppercase tracking-wide">Consultation</p>
              <p className="text-sm text-slate-700">{formatDate(res.consultation.dateConsultation, res.consultation.heure)}</p>
              {res.consultation.lienVisio && (
                <a href={res.consultation.lienVisio} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-emerald-600 hover:underline text-sm">
                  <Video size={14} /> Lien visio
                </a>
              )}
            </div>
          )}
        </div>

        <button onClick={onClose}
          className="mt-5 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition">
          Fermer
        </button>
      </motion.div>
    </div>
  );
}

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selectedRes, setSelectedRes] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (proId) chargerReservations(); }, [proId]);

  const chargerReservations = async () => {
    try {
      setRefreshing(true);
      const data = await getReservations(proId);
      setReservations(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des réservations.');
    } finally { setRefreshing(false); }
  };

  const handleUpdate = async (id, status) => {
    const label = status === 'VALIDE' ? "l'acceptation" : 'le refus';
    if (!window.confirm(`Confirmer ${label} de cette réservation ?`)) return;
    try {
      await updateReservationStatus(id, status);
      await chargerReservations();
    } catch {
      setError('Erreur lors de la mise à jour.');
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
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-800">Réservations</h2>
        <button onClick={chargerReservations}
          className={`flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition ${refreshing ? 'opacity-60' : ''}`}>
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* FILTRES */}
      <div className="flex flex-wrap gap-2">
        {STATUTS.map(s => {
          const cfg = STATUT_CONFIG[s];
          const active = filtreStatut === s;
          return (
            <button key={s} onClick={() => setFiltreStatut(s)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                active
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}>
              {s === 'TOUS' ? <Filter size={12} /> : cfg && <cfg.icon size={12} />}
              {s === 'TOUS' ? 'Tous' : cfg?.label || s}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                {counts[s]}
              </span>
            </button>
          );
        })}
      </div>

      {/* LISTE */}
      {reservations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <CalendarCheck className="text-slate-200 mx-auto mb-3" size={40} />
          <p className="text-slate-500 font-medium">Aucune réservation pour le moment.</p>
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
                onAccept={(id) => handleUpdate(id, 'VALIDE')}
                onRefuse={(id) => handleUpdate(id, 'REFUSE')}
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