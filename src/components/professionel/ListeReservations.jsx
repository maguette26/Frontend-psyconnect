import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import {
  CheckCircle, XCircle, Clock, Info, Video,
  CalendarCheck, Filter, RefreshCw, User, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const STATUT_CONFIG = {
  EN_ATTENTE: {
    label: 'En attente',
    bg: '#FFFBEB', text: '#B45309', border: '#FDE68A',
    dot: '#F59E0B',
    icon: Clock,
  },
  VALIDE: {
    label: 'Validée',
    bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0',
    dot: '#22C55E',
    icon: CheckCircle,
  },
  REFUSE: {
    label: 'Refusée',
    bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA',
    dot: '#EF4444',
    icon: XCircle,
  },
};

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut];
  if (!cfg) return <span style={{ fontSize: 11, color: '#94A3B8' }}>{statut}</span>;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 600,
      background: cfg.bg, color: cfg.text,
      border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}

function Avatar({ prenom, nom }) {
  const initials = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  const colors = [
    ['#EEF2FF', '#4F46E5'], ['#F0FDF4', '#16A34A'], ['#FFF7ED', '#EA580C'],
    ['#F5F3FF', '#7C3AED'], ['#FDF2F8', '#BE185D'],
  ];
  const idx = (prenom?.charCodeAt(0) || 0) % colors.length;
  const [bg, color] = colors[idx];
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
      background: bg, color, fontWeight: 700, fontSize: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `1.5px solid ${color}20`,
    }}>
      {initials || <User size={16} />}
    </div>
  );
}

const formatDate = (dateString, timeString) => {
  if (!dateString) return 'N/A';
  try {
    const dt = new Date(`${dateString}T${timeString || '00:00'}:00`);
    return dt.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return `${dateString} ${timeString || ''}`; }
};

function ReservationCard({ res, onAccept, onRefuse, onDetails }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        background: '#fff',
        border: '1px solid #E8EDF2',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)'}
    >
      {/* MAIN ROW */}
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <Avatar prenom={res.utilisateur?.prenom} nom={res.utilisateur?.nom} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                {res.utilisateur?.prenom} {res.utilisateur?.nom}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={10} />
                {res.utilisateur?.email}
              </p>
            </div>
            <StatutBadge statut={res.statut} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, color: '#475569',
              background: '#F8FAFC', padding: '4px 10px', borderRadius: 8,
              border: '1px solid #E2E8F0',
            }}>
              <CalendarCheck size={11} color="#6366F1" />
              {formatDate(res.dateReservation, res.heureDebut)}
            </span>
            <span style={{ fontSize: 11, color: '#CBD5E1', fontFamily: 'monospace' }}>#{res.id}</span>
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
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', background: '#FAFBFC' }}>
              {res.statut === 'VALIDE' && res.consultation ? (
                <div style={{
                  background: '#F0FDF4', border: '1px solid #BBF7D0',
                  borderRadius: 14, padding: '14px 16px',
                }}>
                  <p style={{ margin: '0 0 8px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#16A34A' }}>
                    Consultation confirmée
                  </p>
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarCheck size={13} color="#22C55E" />
                    {formatDate(res.consultation.dateConsultation, res.consultation.heure)}
                  </p>
                  {res.consultation.lienVisio && (
                    <a href={res.consultation.lienVisio} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', background: '#16A34A', color: '#fff',
                        borderRadius: 10, fontSize: 12.5, fontWeight: 600,
                        textDecoration: 'none', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
                      onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
                    >
                      <Video size={13} />
                      Rejoindre la visio
                    </a>
                  )}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: '#CBD5E1', fontStyle: 'italic' }}>
                  Aucune consultation associée.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <div style={{
        padding: '11px 20px',
        borderTop: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12.5, fontWeight: 600, color: '#6366F1',
            display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0',
            fontFamily: 'inherit', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#4338CA'}
          onMouseLeave={e => e.currentTarget.style.color = '#6366F1'}
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Masquer' : 'Voir détails'}
        </button>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {res.statut === 'EN_ATTENTE' && (
            <>
              <button onClick={() => onAccept(res.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', background: '#F0FDF4',
                border: '1px solid #BBF7D0', color: '#16A34A',
                borderRadius: 10, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#16A34A'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.color = '#16A34A'; }}
              >
                <CheckCircle size={12} /> Accepter
              </button>
              <button onClick={() => onRefuse(res.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', background: '#FEF2F2',
                border: '1px solid #FECACA', color: '#DC2626',
                borderRadius: 10, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
              >
                <XCircle size={12} /> Refuser
              </button>
            </>
          )}
          <button onClick={() => onDetails(res)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 14px', background: '#F8FAFC',
            border: '1px solid #E2E8F0', color: '#475569',
            borderRadius: 10, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
          >
            <Info size={12} /> Détails
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DetailsModal({ res, onClose }) {
  if (!res) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(4px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '0 16px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 22,
          boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
          width: '100%', maxWidth: 440, padding: '28px 28px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Détails de la réservation
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#94A3B8', fontFamily: 'monospace' }}>#{res.id}</p>
          </div>
          <button onClick={onClose} style={{
            padding: 8, borderRadius: 10, border: 'none', background: '#F1F5F9',
            cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
          >
            <XCircle size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Patient', value: `${res.utilisateur?.prenom} ${res.utilisateur?.nom}` },
            { label: 'Email', value: res.utilisateur?.email },
            { label: 'Date', value: formatDate(res.dateReservation, res.heureDebut) },
            { label: 'Statut', value: <StatutBadge statut={res.statut} /> },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: '#F8FAFC', borderRadius: 12, padding: '12px 16px',
              border: '1px solid #F1F5F9',
            }}>
              <p style={{ margin: '0 0 3px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94A3B8' }}>
                {label}
              </p>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: '#1E293B' }}>{value}</div>
            </div>
          ))}

          {res.statut === 'VALIDE' && res.consultation && (
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              borderRadius: 12, padding: '12px 16px',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#16A34A' }}>
                Consultation
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#166534' }}>
                {formatDate(res.consultation.dateConsultation, res.consultation.heure)}
              </p>
              {res.consultation.lienVisio && (
                <a href={res.consultation.lienVisio} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    marginTop: 8, fontSize: 12.5, color: '#16A34A', fontWeight: 600,
                    textDecoration: 'none',
                  }}>
                  <Video size={13} /> Lien visio
                </a>
              )}
            </div>
          )}
        </div>

        <button onClick={onClose} style={{
          marginTop: 18, width: '100%', padding: '12px',
          background: '#18181B', color: '#fff', border: 'none',
          borderRadius: 12, fontSize: 13.5, fontWeight: 600,
          fontFamily: 'inherit', cursor: 'pointer', transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#27272A'}
          onMouseLeave={e => e.currentTarget.style.background = '#18181B'}
        >
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
      setError('Erreur lors du chargement des réservations.');
    } finally { setRefreshing(false); }
  };

  const handleUpdate = async (id, status) => {
    const label = status === 'VALIDE' ? "l'acceptation" : 'le refus';
    if (!window.confirm(`Confirmer ${label} de cette réservation ?`)) return;
    try {
      await updateReservationStatus(id, status);
      await chargerReservations();
    } catch { setError('Erreur lors de la mise à jour.'); }
  };

  const reservationsFiltrees = filtreStatut === 'TOUS'
    ? reservations
    : reservations.filter(r => r.statut === filtreStatut);

  const counts = STATUTS.reduce((acc, s) => {
    acc[s] = s === 'TOUS' ? reservations.length : reservations.filter(r => r.statut === s).length;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Réservations
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#94A3B8', fontStyle: 'italic', fontFamily: "'Instrument Serif', serif" }}>
            {reservations.length} réservation{reservations.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={chargerReservations}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', background: '#F8FAFC',
            border: '1.5px solid #E2E8F0', borderRadius: 12,
            fontSize: 13, fontWeight: 600, color: '#475569',
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s', opacity: refreshing ? 0.6 : 1,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
          onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
        >
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          Actualiser
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {error && (
        <div style={{
          marginBottom: 16, padding: '12px 16px',
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: 12, fontSize: 13, color: '#DC2626',
        }}>
          {error}
        </div>
      )}

      {/* FILTRES */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {STATUTS.map(s => {
          const cfg = STATUT_CONFIG[s];
          const active = filtreStatut === s;
          return (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                background: active ? '#18181B' : '#F8FAFC',
                border: `1.5px solid ${active ? '#18181B' : '#E2E8F0'}`,
                borderRadius: 10,
                fontSize: 12, fontWeight: 600,
                color: active ? '#fff' : '#64748B',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = '#CBD5E1'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = '#E2E8F0'; }}
            >
              {s === 'TOUS' ? <Filter size={11} /> : cfg && <cfg.icon size={11} />}
              {s === 'TOUS' ? 'Tous' : cfg?.label || s}
              <span style={{
                fontSize: 10.5, fontWeight: 700,
                background: active ? 'rgba(255,255,255,0.18)' : '#E2E8F0',
                color: active ? '#fff' : '#64748B',
                padding: '1px 6px', borderRadius: 20,
              }}>
                {counts[s]}
              </span>
            </button>
          );
        })}
      </div>

      {/* LISTE */}
      {reservations.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '56px 24px',
          background: '#fff', borderRadius: 18,
          border: '1px solid #E8EDF2',
        }}>
          <CalendarCheck size={36} color="#E2E8F0" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#94A3B8' }}>
            Aucune réservation pour le moment.
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#CBD5E1' }}>
            Les nouvelles réservations apparaîtront ici.
          </p>
        </div>
      ) : reservationsFiltrees.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 24px',
          background: '#F8FAFC', borderRadius: 16,
          border: '1px dashed #E2E8F0',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>
            Aucune réservation avec ce statut.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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