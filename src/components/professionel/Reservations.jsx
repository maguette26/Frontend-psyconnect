import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];
const LABELS  = { EN_ATTENTE: 'En attente', VALIDE: 'Validé', REFUSE: 'Refusé' };

const BADGE_COLORS = {
  EN_ATTENTE: { bg: '#FAEEDA', color: '#633806' },
  VALIDE:     { bg: '#EAF3DE', color: '#27500A' },
  REFUSE:     { bg: '#FCEBEB', color: '#791F1F' },
};

const FILTER_ACTIVE = {
  TOUS:       { background: '#1a1a2e', color: '#e8e4ff', borderColor: '#1a1a2e' },
  EN_ATTENTE: { background: '#FAC775', color: '#412402', borderColor: '#FAC775' },
  VALIDE:     { background: '#C0DD97', color: '#173404', borderColor: '#C0DD97' },
  REFUSE:     { background: '#F7C1C1', color: '#501313', borderColor: '#F7C1C1' },
};

function initials(prenom, nom) {
  return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
}

function fmtDate(dateStr) {
  if (!dateStr) return 'N/A';
  const dt = new Date(dateStr + 'T12:00:00');
  return dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function fmtHeure(heure) {
  if (!heure) return 'N/A';
  return heure.replace(':', 'h');
}

function Avatar({ prenom, nom, statut, size = 38 }) {
  const s = BADGE_COLORS[statut] ?? BADGE_COLORS.EN_ATTENTE;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {initials(prenom, nom)}
    </div>
  );
}

 

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [error,        setError]        = useState('');
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selected,     setSelected]     = useState(null);

  useEffect(() => { if (proId) chargerReservations(); }, [proId]);

  const chargerReservations = async () => {
    try {
      const data = await getReservations(proId);
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
      padding: '1.5rem',
      maxWidth: 720,
      margin: '0 auto',
      fontFamily: "'Sora', 'Inter', sans-serif",
      boxSizing: 'border-box',
    }}>

      {/* TITRE */}
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 1.25rem', color: '#111' }}>
        Réservations
      </h1>

      {/* SOUS-TITRE + COMPTEUR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: 13, color: '#888' }}>Gestion des séances</span>
        <span style={{
          fontFamily: 'monospace', fontSize: 12, color: '#888',
          background: '#f5f5f5', padding: '4px 10px',
          borderRadius: 20, border: '0.5px solid #e5e5e5',
        }}>
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* FILTRES */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STATUTS.map(s => {
          const active = filtreStatut === s;
          return (
            <button key={s} onClick={() => setFiltreStatut(s)} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
              border: '0.5px solid #ccc', background: 'transparent', color: '#666',
              ...(active ? FILTER_ACTIVE[s] : {}),
            }}>
              {s === 'TOUS' ? 'Tous' : LABELS[s]}{' '}
              <span style={{ opacity: 0.6 }}>{countFor(s)}</span>
            </button>
          );
        })}
      </div>

      {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {/* LISTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '3rem 1rem', color: '#aaa', fontSize: 14 }}>
            Aucune réservation
          </p>
        )}

        {filtered.map(res => (
          <div
            key={res.id}
            onClick={() => setSelected(res)}
            style={{
              background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: 12,
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
              boxSizing: 'border-box', minWidth: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#bbb'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e8'}
          >
            {/* Avatar */}
            <Avatar prenom={res.utilisateur?.prenom} nom={res.utilisateur?.nom} statut={res.statut} />

            {/* Infos — flex:1 + minWidth:0 pour ne pas déborder */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: '0 0 4px', fontWeight: 600, fontSize: 14, color: '#111',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {res.utilisateur?.prenom} {res.utilisateur?.nom}
              </p>
              {/* META : icônes SVG inline Tabler-style */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, color: '#999', flexWrap: 'wrap',
              }}>
                {/* Icône calendrier */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ whiteSpace: 'nowrap' }}>{fmtDate(res.dateReservation)}</span>

                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#ddd', flexShrink: 0 }} />

                {/* Icône horloge */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
                </svg>
                <span style={{ whiteSpace: 'nowrap' }}>Résa. {fmtHeure(res.heureReservation ?? res.heureDebut)}</span>

                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#ddd', flexShrink: 0 }} />

                {/* Icône stéthoscope simplifié */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M4.5 6.5a5 5 0 0 0 5 5v3a3.5 3.5 0 0 0 7 0v-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4"/><path d="M4.5 6.5H7m-2.5 0A2.5 2.5 0 0 1 7 4h3a2.5 2.5 0 0 1 0 5H7"/>
                </svg>
                <span style={{ whiteSpace: 'nowrap' }}>Consult. {fmtHeure(res.heureDebut)}</span>
              </div>
            </div>

            {/* Actions — flexShrink:0 pour ne pas écraser */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
             <button
  title="Voir détails"
  onClick={e => { e.stopPropagation(); setSelected(res); }}
  style={{
    width: 30,
    height: 30,
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '0.5px solid #e0e0e0',
    background: 'transparent',
    color: '#444',
    transition: 'all 0.12s',
  }}
  onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
>
  <EyeIcon />
</button>

              {res.statut === 'EN_ATTENTE' && (
                <>
                  <button
                    title="Valider"
                    onClick={e => { e.stopPropagation(); handleUpdateStatus(res.id, 'VALIDE'); }}
                    style={iconBtn}
                    onMouseEnter={e => { e.currentTarget.style.background = '#EAF3DE'; e.currentTarget.style.borderColor = '#C0DD97'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <button
                    title="Refuser"
                    onClick={e => { e.stopPropagation(); handleUpdateStatus(res.id, 'REFUSE'); }}
                    style={iconBtn}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FCEBEB'; e.currentTarget.style.borderColor = '#F7C1C1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#791F1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </>
              )}

              <button
                title="Détails"
                onClick={e => { e.stopPropagation(); setSelected(res); }}
                style={iconBtn}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <div
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 999, padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 16,
                width: '100%', maxWidth: 400,
                border: '0.5px solid #ddd', overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '20px 20px 16px', borderBottom: '0.5px solid #eee',
                display: 'flex', gap: 14, alignItems: 'center',
              }}>
                <Avatar prenom={selected.utilisateur?.prenom} nom={selected.utilisateur?.nom} statut={selected.statut} size={48} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: 16, color: '#111' }}>
                    {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selected.utilisateur?.email ?? 'Email indisponible'}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={sectionLabel}>Date &amp; horaires</p>

                <ModalRow icon={<CalIcon />} label="Date de réservation">
                  {fmtDate(selected.dateReservation)}
                </ModalRow>
                
                <ModalRow icon={<StethIcon />} label="Heure de consultation">
                  {fmtHeure(selected.heureDebut)}
                </ModalRow>

                <div style={{ height: 1, background: '#eee', margin: '4px 0' }} />

                <p style={sectionLabel}>Statut</p>
                <ModalRow icon={<TagIcon />} label="Statut de la réservation">
                  <Badge statut={selected.statut} />
                </ModalRow>
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 20px', borderTop: '0.5px solid #eee', display: 'flex', gap: 8 }}>
                {selected.statut === 'EN_ATTENTE' && (
                  <>
                    <button
                      onClick={() => { handleUpdateStatus(selected.id, 'VALIDE'); setSelected(null); }}
                      style={{ flex: 1, padding: 9, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '0.5px solid #C0DD97', background: '#EAF3DE', color: '#27500A' }}
                    >✓ Valider</button>
                    <button
                      onClick={() => { handleUpdateStatus(selected.id, 'REFUSE'); setSelected(null); }}
                      style={{ flex: 1, padding: 9, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '0.5px solid #F7C1C1', background: '#FCEBEB', color: '#791F1F' }}
                    >✕ Refuser</button>
                  </>
                )}
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    flex: selected.statut === 'EN_ATTENTE' ? 1 : 3,
                    padding: 9, borderRadius: 8, fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', border: 'none', background: '#1a1a2e', color: '#e8e4ff',
                  }}
                >Fermer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Styles utilitaires ── */
const iconBtn = {
  width: 30, height: 30, borderRadius: 8, cursor: 'pointer', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '0.5px solid #e0e0e0', background: 'transparent', transition: 'all 0.12s',
};

const sectionLabel = {
  margin: '0 0 6px', fontSize: 10, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bbb',
};

function ModalRow({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
      <span style={{ width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#aaa' }}>
        {icon}
      </span>
      <span style={{ width: 160, flexShrink: 0, color: '#888' }}>{label}</span>
      <span style={{ color: '#111', fontWeight: 500 }}>{children}</span>
    </div>
  );
}

/* ── Icônes SVG ── */
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default ListeReservations;