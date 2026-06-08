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

function fmtDate(dateReservation) {
  if (!dateReservation) return 'N/A';
  const dt = new Date(dateReservation + 'T12:00:00');
  return dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function fmtHeure(heure) {
  if (!heure) return 'N/A';
  return heure.replace(':', 'h');
}

/* ── Avatar ── */
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

/* ── Badge statut ── */
function Badge({ statut }) {
  const s = BADGE_COLORS[statut] ?? BADGE_COLORS.EN_ATTENTE;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 12,
      whiteSpace: 'nowrap', background: s.bg, color: s.color,
    }}>
      {LABELS[statut] ?? statut}
    </span>
  );
}

/* ── Bouton icône ── */
function IconBtn({ onClick, title, children, hoverBg, hoverBorder }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 30, height: 30, borderRadius: 8, cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 600, transition: 'background 0.12s',
        border: `0.5px solid ${hover && hoverBorder ? hoverBorder : '#e0e0e0'}`,
        background: hover && hoverBg ? hoverBg : 'transparent',
        color: '#555',
      }}
    >
      {children}
    </button>
  );
}

/* ── Ligne dans le modal ── */
function ModalRow({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
      <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ minWidth: 155, color: '#888', fontSize: 13 }}>{label}</span>
      <span style={{ color: '#111', fontWeight: 500 }}>{children}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════ */
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

  const countFor = (s) =>
    s === 'TOUS' ? reservations.length : reservations.filter(r => r.statut === s).length;

  return (
    <div style={{
      padding: '1.5rem',
      maxWidth: 720,
      margin: '0 auto',
      fontFamily: "'Sora', 'Inter', sans-serif",
    }}>

      {/* ── TITRE PAGE ── */}
      <h1 style={{
        fontSize: 22, fontWeight: 600, margin: '0 0 1.25rem',
        color: '#111',
      }}>
        Réservations
      </h1>

      {/* ── HEADER (sous-titre + compteur) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>Gestion des séances</span>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#888',
          background: '#f5f5f5', padding: '4px 10px', borderRadius: 20,
          border: '0.5px solid #e5e5e5',
        }}>
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── FILTRES ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STATUTS.map(s => {
          const active = filtreStatut === s;
          return (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
                border: '0.5px solid #ccc',
                background: 'transparent', color: '#666',
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
        <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}

      {/* ── LISTE DES CARTES ── */}
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
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', transition: 'border-color 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#bbb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e8e8e8';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {/* Avatar */}
            <Avatar prenom={res.utilisateur?.prenom} nom={res.utilisateur?.nom} statut={res.statut} />

            {/* Infos */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: '0 0 4px', fontWeight: 600, fontSize: 14, color: '#111',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {res.utilisateur?.prenom} {res.utilisateur?.nom}
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: '#999', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>📅</span>{fmtDate(res.dateReservation)}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#ddd', flexShrink: 0 }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>🕐</span>Consultation {fmtHeure(res.heureDebut)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Badge statut={res.statut} />
              {res.statut === 'EN_ATTENTE' && (
                <>
                  <IconBtn
                    title="Valider"
                    onClick={e => { e.stopPropagation(); handleUpdateStatus(res.id, 'VALIDE'); }}
                    hoverBg="#EAF3DE" hoverBorder="#C0DD97"
                  >✓</IconBtn>
                  <IconBtn
                    title="Refuser"
                    onClick={e => { e.stopPropagation(); handleUpdateStatus(res.id, 'REFUSE'); }}
                    hoverBg="#FCEBEB" hoverBorder="#F7C1C1"
                  >✕</IconBtn>
                </>
              )}
              <IconBtn title="Détails" onClick={e => { e.stopPropagation(); setSelected(res); }}>›</IconBtn>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL ── */}
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
              {/* Header modal */}
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
                  <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: 16, color: '#111' }}>
                    {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                    {selected.utilisateur?.email ?? 'Email indisponible'}
                  </p>
                </div>
              </div>

              {/* Body modal */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Section date & horaires */}
                <p style={{
                  margin: '0 0 4px', fontSize: 10, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bbb',
                }}>
                  Date &amp; horaires
                </p>
                <ModalRow icon="📅" label="Date de réservation">
                  {fmtDate(selected.dateReservation)}
                </ModalRow>
                <ModalRow icon="🕐" label="Heure de consultation">
                  {fmtHeure(selected.heureDebut)}
                </ModalRow>

                <div style={{ height: 1, background: '#eee', margin: '4px 0' }} />

                {/* Section statut */}
                <p style={{
                  margin: '0 0 4px', fontSize: 10, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bbb',
                }}>
                  Statut
                </p>
                <ModalRow icon="🏷" label="Statut de la réservation">
                  <Badge statut={selected.statut} />
                </ModalRow>
              </div>

              {/* Footer modal */}
              <div style={{
                padding: '12px 20px', borderTop: '0.5px solid #eee',
                display: 'flex', gap: 8,
              }}>
                {selected.statut === 'EN_ATTENTE' && (
                  <>
                    <button
                      onClick={() => { handleUpdateStatus(selected.id, 'VALIDE'); setSelected(null); }}
                      style={{
                        flex: 1, padding: 9, borderRadius: 8, fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', border: '0.5px solid #C0DD97',
                        background: '#EAF3DE', color: '#27500A',
                      }}
                    >✓ Valider</button>
                    <button
                      onClick={() => { handleUpdateStatus(selected.id, 'REFUSE'); setSelected(null); }}
                      style={{
                        flex: 1, padding: 9, borderRadius: 8, fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', border: '0.5px solid #F7C1C1',
                        background: '#FCEBEB', color: '#791F1F',
                      }}
                    >✕ Refuser</button>
                  </>
                )}
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    flex: selected.statut === 'EN_ATTENTE' ? 1 : 3,
                    padding: 9, borderRadius: 8, fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', border: 'none',
                    background: '#1a1a2e', color: '#e8e4ff',
                  }}
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListeReservations;