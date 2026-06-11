// src/components/psy/ListeReservations.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { motion, AnimatePresence } from 'framer-motion';

/* ================= CONFIG ================= */
const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];
const LABELS  = { EN_ATTENTE: 'En attente', VALIDE: 'Validé', REFUSE: 'Refusé' };

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', bg: '#FFF8EC', color: '#B45309', border: '#FDE68A', dot: '#F59E0B' },
  VALIDE:     { label: 'Validé',     bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', dot: '#22C55E' },
  REFUSE:     { label: 'Refusé',     bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', dot: '#94A3B8' },
};

const FILTER_ACTIVE = {
  TOUS:       { background: '#1e40af', color: '#fff', borderColor: '#1e40af' },
  EN_ATTENTE: { background: '#FDE68A', color: '#78350F', borderColor: '#FDE68A' },
  VALIDE:     { background: '#BBF7D0', color: '#14532D', borderColor: '#BBF7D0' },
  REFUSE:     { background: '#E2E8F0', color: '#334155', borderColor: '#CBD5E1' },
};

/* ================= UTILS ================= */
function isPassee(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  return new Date(dateStr + 'T00:00:00') < today;
}

/* ================= COMPONENT ================= */
const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [masquerAnciens, setMasquerAnciens] = useState(true);

  /* ===== SAFE TOAST (FIX IMPORTANT) ===== */
  const showToast = (message, type = 'info') => {
    setToast({
      id: Date.now() + Math.random(), // 🔥 FIX removeChild bug
      message,
      type,
    });
  };

  /* ===== LOAD ===== */
  const chargerReservations = useCallback(async () => {
    try {
      const data = await getReservations(proId);
      setReservations(data);
    } catch {
      showToast('Erreur lors du chargement des réservations.', 'error');
    }
  }, [proId]);

  useEffect(() => {
    if (proId) chargerReservations();
  }, [proId, chargerReservations]);

  /* ===== UPDATE STATUS SAFE ===== */
  const handleUpdateStatus = async (id, statut) => {
    if (loadingIds.has(id)) return;

    const snapshot = reservations;

    setLoadingIds(prev => new Set(prev).add(id));

    // optimistic update
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, statut } : r)
    );

    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, statut } : prev);
    }

    try {
      await updateReservationStatus(id, statut);
      showToast(
        statut === 'VALIDE' ? '✓ Réservation validée' : '✕ Réservation refusée',
        statut === 'VALIDE' ? 'success' : 'info'
      );
      await chargerReservations();
    } catch (err) {
      setReservations(snapshot);

      if (selected?.id === id) {
        setSelected(snapshot.find(r => r.id === id));
      }

      showToast('Erreur mise à jour', 'error');
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  /* ===== FILTERS (INCHANGÉS) ===== */
  const applyFilters = (list) => {
    let result = filtreStatut === 'TOUS'
      ? list
      : list.filter(r => r.statut === filtreStatut);

    if (masquerAnciens) {
      result = result.filter(r => {
        if (r.statut === 'REFUSE') return false;
        if (isPassee(r.dateReservation) && r.statut !== 'EN_ATTENTE') return false;
        return true;
      });
    }

    return result;
  };

  const filtered = applyFilters(reservations);

  const countFor = (s) => {
    const base = s === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === s);

    return applyFilters(base).length;
  };

  const nbMasques = reservations.filter(r =>
    r.statut === 'REFUSE' ||
    (isPassee(r.dateReservation) && r.statut !== 'EN_ATTENTE')
  ).length;

  /* ================= UI ================= */
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.25rem' }}>

      {/* TITRE */}
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Réservations</h1>

      {/* FILTRES (INCHANGÉS) */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
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
                border: `1px solid ${active ? '#1e40af' : '#E2E8F0'}`,
                background: active ? '#1e40af' : '#fff',
                color: active ? '#fff' : '#64748B',
                cursor: 'pointer',
              }}
            >
              {s} <span>{countFor(s)}</span>
            </button>
          );
        })}
      </div>

      {/* LISTE */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(res => (
          <div key={res.id} className="resa-card">
            <div>
              <b>{res.utilisateur?.prenom} {res.utilisateur?.nom}</b>
              <div style={{ fontSize: 12 }}>{res.statut}</div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {res.statut === 'EN_ATTENTE' && (
                <>
                  <button onClick={() => handleUpdateStatus(res.id, 'VALIDE')}>Valider</button>
                  <button onClick={() => handleUpdateStatus(res.id, 'REFUSE')}>Refuser</button>
                </>
              )}
              <button onClick={() => setSelected(res)}>Détails</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL FIXED */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              key="modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff',
                padding: 20,
                borderRadius: 16,
              }}
            >
              <h3>Détails</h3>
              <p>{selected.utilisateur?.prenom}</p>
              <button onClick={() => setSelected(null)}>Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST FIXED */}
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              background: '#111',
              color: '#fff',
              padding: 12,
              borderRadius: 10,
            }}
          >
            {toast.message}
            <button onClick={() => setToast(null)}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListeReservations;