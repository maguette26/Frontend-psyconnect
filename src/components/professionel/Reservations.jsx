import React, { useEffect, useState, useCallback } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const LABELS = {
  EN_ATTENTE: 'En attente',
  VALIDE: 'Validées',
  REFUSE: 'Refusées',
};

const COLORS = {
  EN_ATTENTE: '#F59E0B',
  VALIDE: '#22C55E',
  REFUSE: '#EF4444',
};

function isPassee(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  return new Date(dateStr + 'T00:00:00') < today;
}

export default function ListeReservations({ proId }) {

  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('TOUS');
  const [selected, setSelected] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const load = useCallback(async () => {
    const data = await getReservations(proId);
    setReservations(data);
  }, [proId]);

  useEffect(() => {
    if (proId) load();
  }, [proId, load]);

  const updateStatus = async (id, statut) => {
    setLoadingId(id);

    const backup = [...reservations];

    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, statut } : r)
    );

    try {
      await updateReservationStatus(id, statut);
      await load();
    } catch {
      setReservations(backup);
    } finally {
      setLoadingId(null);
    }
  };

  // FILTER LOGIC
  const filtered = reservations.filter(r => {
    if (filter === 'TOUS') return true;
    return r.statut === filter;
  });

  const emptyMessage = () => {
    if (filter === 'TOUS') return "Aucune réservation";
    if (filter === 'EN_ATTENTE') return "Aucune réservation en attente";
    if (filter === 'VALIDE') return "Aucune réservation validée";
    if (filter === 'REFUSE') return "Aucune réservation refusée";
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>

      {/* HEADER */}
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>
        Réservations
      </h2>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 10, margin: '15px 0' }}>
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid #E5E7EB',
              background: filter === s ? '#111827' : '#fff',
              color: filter === s ? '#fff' : '#6B7280',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {s === 'TOUS' ? 'Tous' : LABELS[s]}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            border: '1px dashed #D1D5DB',
            borderRadius: 12,
            color: '#6B7280'
          }}>
            {emptyMessage()}
          </div>
        )}

        {filtered.map(r => (
          <div
            key={r.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 14,
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              background: '#fff'
            }}
          >

            {/* LEFT */}
            <div>
              <div style={{ fontWeight: 600 }}>
                {r.utilisateur?.prenom} {r.utilisateur?.nom}
              </div>

              <div style={{ fontSize: 12, color: '#6B7280' }}>
                {r.dateReservation} • {r.heureReservation}
              </div>

              <div style={{
                fontSize: 12,
                marginTop: 4,
                color: COLORS[r.statut]
              }}>
                ● {r.statut}
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

              {r.statut === 'EN_ATTENTE' && (
                <>
                  <button
                    onClick={() => updateStatus(r.id, 'VALIDE')}
                    disabled={loadingId === r.id}
                  >
                    Valider
                  </button>

                  <button
                    onClick={() => updateStatus(r.id, 'REFUSE')}
                    disabled={loadingId === r.id}
                  >
                    Refuser
                  </button>
                </>
              )}

              <button onClick={() => setSelected(r)}>
                Détails
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DETAILS */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                padding: 24,
                borderRadius: 14,
                width: 400
              }}
            >

              <h3 style={{ marginBottom: 10 }}>
                Détails réservation
              </h3>

              <div style={{ lineHeight: 1.8 }}>
                <div><b>Nom:</b> {selected.utilisateur?.prenom} {selected.utilisateur?.nom}</div>
                <div><b>Email:</b> {selected.utilisateur?.email}</div>
                <div><b>Date:</b> {selected.dateReservation}</div>
                <div><b>Heure:</b> {selected.heureReservation}</div>
                <div><b>Statut:</b> {selected.statut}</div>
              </div>

              <button
                style={{ marginTop: 15 }}
                onClick={() => setSelected(null)}
              >
                Fermer
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}