import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { motion, AnimatePresence } from 'framer-motion';

/* ══════════════════════════════════════════
   CONFIG STATUTS — même style que MesReservations
══════════════════════════════════════════ */
const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];
const LABELS  = { EN_ATTENTE: 'En attente', VALIDE: 'Validé', REFUSE: 'Refusé' };

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', bg: '#FFF8EC', color: '#B45309', border: '#FDE68A', dot: '#F59E0B' },
  VALIDE:     { label: 'Validé',     bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', dot: '#22C55E' },
  REFUSE:     { label: 'Refusé',     bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', dot: '#94A3B8' },
};

const FILTER_ACTIVE = {
  TOUS:       { background: '#1e40af', color: '#fff',    borderColor: '#1e40af' },
  EN_ATTENTE: { background: '#FDE68A', color: '#78350F', borderColor: '#FDE68A' },
  VALIDE:     { background: '#BBF7D0', color: '#14532D', borderColor: '#BBF7D0' },
  REFUSE:     { background: '#E2E8F0', color: '#334155', borderColor: '#CBD5E1' },
};

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function initials(prenom, nom) {
  return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const dt = new Date(dateStr + 'T12:00:00');
  return dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function fmtHeure(h) {
  if (!h) return '—';
  return h.replace(':', 'h');
}

/* ══════════════════════════════════════════
   SOUS-COMPOSANTS
══════════════════════════════════════════ */
function Avatar({ prenom, nom, statut, size = 40 }) {
  const cfg = STATUT_CONFIG[statut] ?? STATUT_CONFIG.EN_ATTENTE;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      border: `1.5px solid ${cfg.border}`,
    }}>
      {initials(prenom, nom)}
    </div>
  );
}

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] ?? STATUT_CONFIG.EN_ATTENTE;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function IconBtn({ onClick, title, children, onHoverStyle, style: extraStyle }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 32, borderRadius: 8, cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        border: '1px solid #E2E8F0', background: hovered && onHoverStyle ? onHoverStyle.background : '#fff',
        color: hovered && onHoverStyle ? onHoverStyle.color : '#475569',
        transition: 'all 0.15s', padding: '0 10px', fontSize: 12, fontWeight: 500,
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

function ModalRow({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
      <span style={{ width: 18, color: '#94A3B8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ width: 165, flexShrink: 0, color: '#64748B' }}>{label}</span>
      <span style={{ color: '#0F172A', fontWeight: 600 }}>{children}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   ICÔNES SVG
══════════════════════════════════════════ */
const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
  </svg>
);
const StethIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 6.5a5 5 0 0 0 5 5v3a3.5 3.5 0 0 0 7 0v-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4"/>
    <path d="M4.5 6.5H7m-2.5 0A2.5 2.5 0 0 1 7 4h3a2.5 2.5 0 0 1 0 5H7"/>
  </svg>
);
const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H7a2 2 0 0 0-2 2v5l9 9 7-7-9-9Z"/><circle cx="6.5" cy="8.5" r="1.5"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ══════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════ */
const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [error,        setError]        = useState('');
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selected,     setSelected]     = useState(null);

  useEffect(() => { if (proId) chargerReservations(); }, [proId]);

  const chargerReservations = async () => {
  try {
    const data = await getReservations(proId);

    console.log("RESERVATIONS :", data);

    setReservations(data);
  } catch {
    setError('Erreur lors du chargement des réservations.');
  }
};

  const handleUpdateStatus = async (id, statut) => {
    if (!window.confirm('Confirmer cette action ?')) return;
    try {
      await updateReservationStatus(id, statut);
      await chargerReservations();
    } catch {
      setError('Erreur lors de la mise à jour.');
    }
  };

  const filtered =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtreStatut);

  const countFor = (s) =>
    s === 'TOUS' ? reservations.length : reservations.filter(r => r.statut === s).length;

  return (
    <div style={{
      maxWidth: 760, margin: '0 auto',
      padding: '2rem 1.25rem',
      fontFamily: "'DM Sans', 'Inter', sans-serif",
      boxSizing: 'border-box',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── TITRE ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: '#0F172A' }}>
          Réservations
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: '#94A3B8' }}>
          Gestion des séances · {reservations.length} au total
        </p>
      </div>

      {/* ── FILTRES + COMPTEUR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUTS.map(s => {
            const active = filtreStatut === s;
            return (
              <button key={s} onClick={() => setFiltreStatut(s)} style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${active ? (FILTER_ACTIVE[s]?.borderColor ?? '#cbd5e1') : '#E2E8F0'}`,
                background: active ? (FILTER_ACTIVE[s]?.background ?? '#f1f5f9') : '#fff',
                color: active ? (FILTER_ACTIVE[s]?.color ?? '#1e293b') : '#64748B',
                boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
              }}>
                {s === 'TOUS' ? 'Tous' : LABELS[s]}{' '}
                <span style={{ opacity: 0.65 }}>{countFor(s)}</span>
              </button>
            );
          })}
        </div>
        <span style={{
          fontFamily: 'monospace', fontSize: 12, color: '#64748B',
          background: '#F1F5F9', padding: '4px 12px', borderRadius: 20,
        }}>
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* ── LISTE ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '4rem 1rem',
            background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <CalIcon />
            </div>
            <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>Aucune réservation</p>
          </div>
        )}

        <AnimatePresence>
          {filtered.map(res => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxSizing: 'border-box', minWidth: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
            >
              {/* Avatar */}
              <Avatar prenom={res.utilisateur?.prenom} nom={res.utilisateur?.nom} statut={res.statut} />

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: '0 0 4px', fontWeight: 700, fontSize: 14, color: '#0F172A',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {res.utilisateur?.prenom} {res.utilisateur?.nom}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94A3B8', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <CalIcon />{fmtDate(res.dateReservation)}
                  </span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#CBD5E1', flexShrink: 0 }} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <ClockIcon />HeureRéservation:{(res.heureReservation)}
                  </span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#CBD5E1', flexShrink: 0 }} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <StethIcon /> HeureConsultation:{(res.heureConsultation)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                <StatutBadge statut={res.statut} />

                {res.statut === 'EN_ATTENTE' && (
                  <>
                    <IconBtn
                      title="Valider"
                      onClick={e => { e.stopPropagation(); handleUpdateStatus(res.id, 'VALIDE'); }}
                      onHoverStyle={{ background: '#F0FDF4', color: '#166534' }}
                    >
                      <CheckIcon /> Valider
                    </IconBtn>
                    <IconBtn
                      title="Refuser"
                      onClick={e => { e.stopPropagation(); handleUpdateStatus(res.id, 'REFUSE'); }}
                      onHoverStyle={{ background: '#FFF1F2', color: '#BE123C' }}
                    >
                      <XIcon /> Refuser
                    </IconBtn>
                  </>
                )}

                <IconBtn
                  title="Voir les détails"
                  onClick={e => { e.stopPropagation(); setSelected(res); }}
                  onHoverStyle={{ background: '#EFF6FF', color: '#1D4ED8' }}
                  style={{ border: '1px solid #BFDBFE', color: '#2563EB', background: '#EFF6FF' }}
                >
                  <EyeIcon /> Détails
                </IconBtn>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 999, padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 20,
                width: '100%', maxWidth: 420,
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                overflow: 'hidden',
              }}
            >
              {/* Header modal */}
              <div style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex', gap: 14, alignItems: 'center',
              }}>
                <Avatar
                  prenom={selected.utilisateur?.prenom}
                  nom={selected.utilisateur?.nom}
                  statut={selected.statut}
                  size={50}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
                    {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selected.utilisateur?.email ?? 'Email indisponible'}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: 4, borderRadius: 6, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#64748B'}
                  onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </button>
              </div>

              {/* Body modal */}
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CBD5E1' }}>
                  Date &amp; horaires
                </p>

                <ModalRow icon={<CalIcon />} label="Date de réservation">
                  {fmtDate(selected.dateReservation)}
                </ModalRow>
                <ModalRow icon={<ClockIcon />} label="Heure de réservation">
                  {fmtHeure(selected.heureReservation ?? selected.heureDebut)}
                </ModalRow>
                <ModalRow icon={<StethIcon />} label="Heure de consultation">
                  {fmtHeure(selected.heureDebut)}
                </ModalRow>

                <div style={{ height: 1, background: '#F1F5F9', margin: '6px 0' }} />

                <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CBD5E1' }}>
                  Statut
                </p>
                <ModalRow icon={<TagIcon />} label="Statut de la réservation">
                  <StatutBadge statut={selected.statut} />
                </ModalRow>
              </div>

              {/* Footer modal */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8 }}>
                {selected.statut === 'EN_ATTENTE' && (
                  <>
                    <button
                      onClick={() => { handleUpdateStatus(selected.id, 'VALIDE'); setSelected(null); }}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid #BBF7D0', background: '#F0FDF4', color: '#166534' }}
                    >✓ Valider</button>
                    <button
                      onClick={() => { handleUpdateStatus(selected.id, 'REFUSE'); setSelected(null); }}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid #FECACA', background: '#FFF1F2', color: '#BE123C' }}
                    >✕ Refuser</button>
                  </>
                )}
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    flex: selected.statut === 'EN_ATTENTE' ? 1 : 3,
                    padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', border: 'none', background: '#1e3a8a', color: '#fff',
                  }}
                >Fermer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListeReservations;