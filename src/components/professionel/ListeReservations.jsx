import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import {
  CheckCircle, XCircle, Clock, Info, Video,
  Calendar, RefreshCw, User, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', color: '#F59E0B', icon: Clock },
  VALIDE: { label: 'Validée', color: '#22C55E', icon: CheckCircle },
  REFUSE: { label: 'Refusée', color: '#EF4444', icon: XCircle },
};

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [filtre, setFiltre] = useState('TOUS');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (proId) load();
  }, [proId]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getReservations(proId);
      setReservations(data);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, status) => {
    await updateReservationStatus(id, status);
    load();
  };

  const filtered =
    filtre === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtre);

  return (
    <div className="psy-app">

      {/* HEADER MOBILE */}
      <div className="psy-header">
        <div>
          <h1>Réservations</h1>
          <p>Gestion des consultations</p>
        </div>

        <button onClick={load} className="psy-refresh">
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* FILTERS (scroll horizontal mobile-first) */}
      <div className="psy-filters">
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFiltre(s)}
            className={`chip ${filtre === s ? 'active' : ''}`}
          >
            {s === 'TOUS' ? <Filter size={14} /> : STATUT_CONFIG[s].icon && <STATUT_CONFIG[s].icon size={14} />}
            {s}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="psy-list">
        <AnimatePresence>
          {filtered.map(r => {
            const cfg = STATUT_CONFIG[r.statut];

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="psy-card"
                onClick={() => setSelected(r)}
              >
                {/* TOP */}
                <div className="psy-card-top">
                  <div className="avatar">
                    {r.utilisateur?.prenom?.[0]}{r.utilisateur?.nom?.[0]}
                  </div>

                  <div className="info">
                    <h3>{r.utilisateur?.prenom} {r.utilisateur?.nom}</h3>
                    <p><User size={12} /> {r.utilisateur?.email}</p>
                  </div>

                  <span
                    className="badge"
                    style={{ background: cfg?.color + '20', color: cfg?.color }}
                  >
                    {cfg?.label}
                  </span>
                </div>

                {/* DATE */}
                <div className="date">
                  <Calendar size={14} />
                  {r.dateReservation} • {r.heureDebut}
                </div>

                {/* ACTIONS */}
                {r.statut === 'EN_ATTENTE' && (
                  <div className="actions">
                    <button onClick={(e) => { e.stopPropagation(); update(r.id, 'VALIDE'); }}>
                      <CheckCircle size={14} /> Accepter
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); update(r.id, 'REFUSE'); }}>
                      <XCircle size={14} /> Refuser
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* MODAL SIMPLE MOBILE */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>Détails</h2>

              <p><b>Nom:</b> {selected.utilisateur?.prenom} {selected.utilisateur?.nom}</p>
              <p><b>Email:</b> {selected.utilisateur?.email}</p>
              <p><b>Date:</b> {selected.dateReservation}</p>

              {selected.consultation?.lienVisio && (
                <a href={selected.consultation.lienVisio} target="_blank">
                  <Video size={14} /> Rejoindre la visio
                </a>
              )}

              <button onClick={() => setSelected(null)}>Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STYLE MOBILE-FIRST */}
      <style>{`
        .psy-app {
          font-family: Inter, sans-serif;
          background: #f6f7fb;
          min-height: 100vh;
          padding: 16px;
        }

        .psy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .psy-header h1 {
          font-size: 20px;
          margin: 0;
        }

        .psy-header p {
          font-size: 12px;
          color: #777;
        }

        .psy-refresh {
          background: white;
          border: none;
          padding: 10px;
          border-radius: 12px;
        }

        .spin { animation: spin 1s linear infinite; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .psy-filters {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 10px;
        }

        .chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid #ddd;
          background: white;
          font-size: 12px;
          white-space: nowrap;
        }

        .chip.active {
          background: #6366f1;
          color: white;
          border: none;
        }

        .psy-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .psy-card {
          background: white;
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .psy-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #e0e7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .info {
          flex: 1;
          margin-left: 10px;
        }

        .info h3 {
          margin: 0;
          font-size: 14px;
        }

        .info p {
          margin: 2px 0 0;
          font-size: 11px;
          color: #777;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .badge {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .date {
          margin-top: 10px;
          font-size: 12px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .actions button {
          flex: 1;
          border: none;
          padding: 10px;
          border-radius: 10px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .actions button:first-child {
          background: #ecfdf5;
          color: #16a34a;
        }

        .actions button:last-child {
          background: #fef2f2;
          color: #dc2626;
        }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: flex-end;
        }

        .modal-content {
          background: white;
          width: 100%;
          border-radius: 20px 20px 0 0;
          padding: 16px;
        }
      `}</style>
    </div>
  );
};

export default ListeReservations;