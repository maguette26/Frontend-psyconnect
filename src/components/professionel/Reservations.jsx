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
  return dt.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

function fmtHeure(heure) {
  if (!heure) return 'N/A';
  return heure.replace(':', 'h');
}

function Avatar({ prenom, nom, statut, size = 38 }) {
  const s = BADGE_COLORS[statut] ?? BADGE_COLORS.EN_ATTENTE;
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.33,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>
      {initials(prenom, nom)}
    </div>
  );
}

/* ❌ Badge supprimé volontairement */

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (proId) chargerReservations();
  }, [proId]);

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
    s === 'TOUS'
      ? reservations.length
      : reservations.filter(r => r.statut === s).length;

  return (
    <div style={{
      padding: '1.5rem',
      maxWidth: 720,
      margin: '0 auto',
      fontFamily: "'Sora', 'Inter', sans-serif",
      boxSizing: 'border-box',
    }}>

      <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 1.25rem', color: '#111' }}>
        Réservations
      </h1>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <span style={{ fontSize: 13, color: '#888' }}>
          Gestion des séances
        </span>

        <span style={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#888',
          background: '#f5f5f5',
          padding: '4px 10px',
          borderRadius: 20,
          border: '0.5px solid #e5e5e5',
        }}>
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STATUTS.map(s => {
          const active = filtreStatut === s;
          return (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                border: '0.5px solid #ccc',
                background: 'transparent',
                color: '#666',
                ...(active ? FILTER_ACTIVE[s] : {}),
              }}
            >
              {s === 'TOUS' ? 'Tous' : LABELS[s]}{' '}
              <span style={{ opacity: 0.6 }}>{countFor(s)}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>
          {error}
        </p>
      )}

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
              background: '#fff',
              border: '0.5px solid #e8e8e8',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxSizing: 'border-box',
              minWidth: 0,
            }}
          >
            <Avatar
              prenom={res.utilisateur?.prenom}
              nom={res.utilisateur?.nom}
              statut={res.statut}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: '0 0 4px',
                fontWeight: 600,
                fontSize: 14,
                color: '#111',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {res.utilisateur?.prenom} {res.utilisateur?.nom}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: '#999',
                flexWrap: 'wrap',
              }}>
                <span>{fmtDate(res.dateReservation)}</span>

                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#ddd' }} />

                <span>Réservation {fmtHeure(res.heureReservation)}</span>

                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#ddd' }} />

                <span>Consult. {fmtHeure(res.heureDebut)}</span>
              </div>
            </div>

            {/* ✅ ICI: Badge remplacé par œil */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>

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
                }}
              >
                <EyeIcon />
              </button>

            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <div
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: 16,
                width: '100%',
                maxWidth: 400,
                border: '0.5px solid #ddd',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: 20 }}>
                <p style={{ fontWeight: 600 }}>
                  {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ✅ Eye Icon */
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default ListeReservations;