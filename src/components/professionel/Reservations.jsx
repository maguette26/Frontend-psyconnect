import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];
const LABELS  = { EN_ATTENTE: 'En attente', VALIDE: 'Validé', REFUSE: 'Refusé' };

/* ─── helpers ─────────────────────────────────────────────── */
function initials(prenom, nom) {
  return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
}

function fmtDate(dateReservation) {
  if (!dateReservation) return 'N/A';
  const dt = new Date(dateReservation + 'T12:00:00');
  return dt.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
  });
}

function fmtHeure(heure) {
  if (!heure) return 'N/A';
  return heure.replace(':', 'h');   // "12:00" → "12h00"
}

/* ─── sous-composants ─────────────────────────────────────── */
const BADGE_STYLE = {
  EN_ATTENTE: { bg: '#FAEEDA', color: '#633806' },
  VALIDE:     { bg: '#EAF3DE', color: '#27500A' },
  REFUSE:     { bg: '#FCEBEB', color: '#791F1F' },
};

const AVATAR_STYLE = {
  EN_ATTENTE: { bg: '#FAEEDA', color: '#633806' },
  VALIDE:     { bg: '#EAF3DE', color: '#27500A' },
  REFUSE:     { bg: '#FCEBEB', color: '#791F1F' },
};

function Badge({ statut }) {
  const s = BADGE_STYLE[statut] ?? BADGE_STYLE.EN_ATTENTE;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 9px',
      borderRadius: 12, whiteSpace: 'nowrap',
      background: s.bg, color: s.color,
    }}>
      {LABELS[statut] ?? statut}
    </span>
  );
}

function Avatar({ prenom, nom, statut, size = 38 }) {
  const s = AVATAR_STYLE[statut] ?? AVATAR_STYLE.EN_ATTENTE;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {initials(prenom, nom)}
    </div>
  );
}

/* ─── composant principal ─────────────────────────────────── */
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
      setError('Erreur lors de la mise à jour du statut.');
    }
  };

  const filtered =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtreStatut);

  /* ── compteurs pour les filtres ── */
  const count = (s) =>
    s === 'TOUS'
      ? reservations.length
      : reservations.filter(r => r.statut === s).length;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto', fontFamily: 'Sora, sans-serif' }}>

      {/* TITRE */}
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 1.25rem', color: 'var(--color-text-primary, #111)' }}>
        Réservations
      </h1>

      {/* FILTRES */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STATUTS.map(s => {
          const active = filtreStatut === s;
          const accentStyle =
            active && s === 'EN_ATTENTE' ? { background: '#FAC775', color: '#412402', borderColor: '#FAC775' }
            : active && s === 'VALIDE'   ? { background: '#C0DD97', color: '#173404', borderColor: '#C0DD97' }
            : active && s === 'REFUSE'   ? { background: '#F7C1C1', color: '#501313', borderColor: '#F7C1C1' }
            : active                     ? { background: '#1a1a2e', color: '#e8e4ff', borderColor: '#1a1a2e' }
            : {};
          return (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: '0.5px solid #ccc',
                background: 'transparent', color: '#666',
                transition: 'all 0.15s',
                ...accentStyle,
              }}
            >
              {s === 'TOUS' ? 'Tous' : LABELS[s]}
              {' '}
              <span style={{ opacity: 0.6 }}>{count(s)}</span>
            </button>
          );
        })}
      </div>

      {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {/* LISTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999', fontSize: 14 }}>
            Aucune réservation
          </p>
        )}

        {filtered.map(res => (
          <div
            key={res.id}
            onClick={() => setSelected(res)}
            style={{
              background: '#fff',
              border: '0.5px solid #e5e5e5',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              transition: 'border-color 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#aaa'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e5e5'}
          >
            {/* AVATAR */}
            <Avatar
              prenom={res.utilisateur?.prenom}
              nom={res.utilisateur?.nom}
              statut={res.statut}
            />

            {/* INFOS */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 14, color: '#111',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {res.utilisateur?.prenom} {res.utilisateur?.nom}
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center',
                            fontSize: 11, color: '#888', flexWrap: 'wrap' }}>
                <span>📅 {fmtDate(res.dateReservation)}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#ccc' }} />
                <span>🕐 Consultation : {fmtHeure(res.heureDebut)}</span>
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Badge statut={res.statut} />

              {res.statut === 'EN_ATTENTE' && (
                <>
                  <button
                    title="Valider"
                    onClick={e => { e.stopPropagation(); handleUpdateStatus(res.id, 'VALIDE'); }}
                    style={btnStyle('#EAF3DE', '#C0DD97')}
                  >✓</button>
                  <button
                    title="Refuser"
                    onClick={e => { e.stopPropagation(); handleUpdateStatus(res.id, 'REFUSE'); }}
                    style={btnStyle('#FCEBEB', '#F7C1C1')}
                  >✕</button>
                </>
              )}

              <button
                title="Détails"
                onClick={e => { e.stopPropagation(); setSelected(res); }}
                style={btnStyle()}
              >›</button>
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
              animate={{ scale: 1,    opacity: 1 }}
              exit={{    scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400,
                border: '0.5px solid #ddd', overflow: 'hidden',
              }}
            >
              {/* HEADER MODAL */}
              <div style={{
                padding: '20px 20px 16px', borderBottom: '0.5px solid #eee',
                display: 'flex', gap: 14, alignItems: 'center',
              }}>
                <Avatar
                  prenom={selected.utilisateur?.prenom}
                  nom={selected.utilisateur?.nom}
                  statut={selected.statut}
                  size={48}
                />
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 16 }}>
                    {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
                    {selected.utilisateur?.email ?? 'Email indisponible'}
                  </p>
                </div>
              </div>

              {/* BODY MODAL */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={sectionTitle}>Date & horaires</p>

                <ModalRow icon="📅" label="Date de réservation">
                  {fmtDate(selected.dateReservation)}
                </ModalRow>
                <ModalRow icon="🕐" label="Heure de consultation">
                  {fmtHeure(selected.heureDebut)}
                </ModalRow>

                <div style={{ height: 1, background: '#eee', margin: '4px 0' }} />

                <p style={sectionTitle}>Statut</p>
                <ModalRow icon="🏷" label="Statut de la réservation">
                  <Badge statut={selected.statut} />
                </ModalRow>
              </div>

              {/* FOOTER MODAL */}
              <div style={{ padding: '12px 20px', borderTop: '0.5px solid #eee', display: 'flex', gap: 8 }}>
                {selected.statut === 'EN_ATTENTE' && (
                  <>
                    <button
                      onClick={() => { handleUpdateStatus(selected.id, 'VALIDE'); setSelected(null); }}
                      style={{ ...modalActionBtn, background: '#EAF3DE', color: '#27500A', borderColor: '#C0DD97' }}
                    >✓ Valider</button>
                    <button
                      onClick={() => { handleUpdateStatus(selected.id, 'REFUSE'); setSelected(null); }}
                      style={{ ...modalActionBtn, background: '#FCEBEB', color: '#791F1F', borderColor: '#F7C1C1' }}
                    >✕ Refuser</button>
                  </>
                )}
                <button
                  onClick={() => setSelected(null)}
                  style={{ ...modalActionBtn, flex: 2, background: '#1a1a2e', color: '#e8e4ff', border: 'none' }}
                >Fermer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── styles utilitaires ──────────────────────────────────── */
const btnStyle = (bg, border) => ({
  width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 15, fontWeight: 600,
  border: `0.5px solid ${border ?? '#e0e0e0'}`,
  background: bg ?? 'transparent',
});

const sectionTitle = {
  margin: '0 0 4px',
  fontSize: 10, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  color: '#aaa',
};

const modalActionBtn = {
  flex: 1, padding: 9, borderRadius: 8,
  fontSize: 13, fontWeight: 500,
  border: '0.5px solid #ddd',
  cursor: 'pointer',
};

function ModalRow({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
      <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ minWidth: 160, color: '#888' }}>{label}</span>
      <strong style={{ color: '#111', fontWeight: 500 }}>{children}</strong>
    </div>
  );
}

export default ListeReservations;