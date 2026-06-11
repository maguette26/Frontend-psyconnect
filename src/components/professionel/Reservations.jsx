// src/components/psy/ListeReservations.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];
const LABELS = {
  EN_ATTENTE: 'En attente',
  VALIDE: 'Validé',
  REFUSE: 'Refusé',
};

function isPassee(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + 'T00:00:00') < today;
}

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [masquerAnciens, setMasquerAnciens] = useState(true);

  // ================= SAFE TOAST =================
  const showToast = (message, type = 'info') => {
    setToast({
      id: Date.now() + Math.random(),
      message,
      type,
    });
  };

  // ================= FETCH =================
  const chargerReservations = useCallback(async () => {
    try {
      const data = await getReservations(proId);
      setReservations(data);
    } catch (e) {
      showToast("Erreur chargement réservations", "error");
    }
  }, [proId]);

  useEffect(() => {
    if (proId) chargerReservations();
  }, [proId, chargerReservations]);

  // ================= UPDATE STATUS SAFE =================
  const handleUpdateStatus = async (id, statut) => {
    if (loadingIds.has(id)) return;

    setLoadingIds(prev => new Set(prev).add(id));

    // snapshot safe
    const snapshot = [...reservations];

    // optimistic UI
    setReservations(prev =>
      prev.map(r => (r.id === id ? { ...r, statut } : r))
    );

    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, statut } : prev);
    }

    try {
      await updateReservationStatus(id, statut);
      showToast(
        statut === 'VALIDE' ? 'Réservation validée' : 'Réservation refusée',
        statut === 'VALIDE' ? 'success' : 'info'
      );

      await chargerReservations();
    } catch (e) {
      // rollback safe
      setReservations(snapshot);
      setSelected(prev =>
        prev?.id === id
          ? snapshot.find(r => r.id === id) || prev
          : prev
      );

      showToast("Erreur mise à jour", "error");
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // ================= FILTER =================
  const filtered = reservations.filter(r => {
    if (filtreStatut !== 'TOUS' && r.statut !== filtreStatut) return false;
    if (masquerAnciens) {
      if (r.statut === 'REFUSE') return false;
      if (isPassee(r.dateReservation) && r.statut !== 'EN_ATTENTE') return false;
    }
    return true;
  });

  return (
    <div style={{ padding: 20 }}>

      {/* ================= LIST ================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(res => (
          <div
            key={res.id}
            style={{
              padding: 12,
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <strong>
                {res.utilisateur?.prenom} {res.utilisateur?.nom}
              </strong>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {res.statut}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {res.statut === 'EN_ATTENTE' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(res.id, 'VALIDE')}
                  >
                    Valider
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(res.id, 'REFUSE')}
                  >
                    Refuser
                  </button>
                </>
              )}

              <button onClick={() => setSelected(res)}>
                Détails
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL SAFE ================= */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                padding: 20,
                borderRadius: 16,
                minWidth: 300,
              }}
            >
              <h3>Détails réservation</h3>

              <p>
                {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
              </p>

              <p>{selected.statut}</p>

              <button onClick={() => setSelected(null)}>
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= TOAST SAFE ================= */}
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

            <button
              onClick={() => setToast(null)}
              style={{ marginLeft: 10 }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ListeReservations;