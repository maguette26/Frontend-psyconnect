import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import {
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Clock,
  Video,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (proId) load();
  }, [proId]);

  const load = async () => {
    try {
      const data = await getReservations(proId);
      setReservations(data);
    } catch {
      setError("Erreur chargement réservations");
    }
  };

  const updateStatus = async (id, status) => {
    if (!window.confirm('Confirmer cette action ?')) return;
    try {
      await updateReservationStatus(id, status);
      await load();
    } catch {
      setError("Erreur mise à jour");
    }
  };

  // ✅ FIX HEURE ROBUSTE
  const getHeure = (c) =>
    c?.heure || c?.heureConsultation || c?.heureDebut || '';

  const format = (d, h) => {
    if (!d) return 'N/A';
    return new Date(`${d}T${h || '00:00'}`).toLocaleString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filtered =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtreStatut);

  return (
    <div className="min-h-screen bg-slate-50 p-4">

      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800">
          📅 Réservations
        </h1>

        <div className="flex gap-2 mt-3 flex-wrap">
          {STATUTS.map(s => (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                filtreStatut === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-500 mb-3">{error}</p>
      )}

      {/* LISTE CARDS */}
      <div className="space-y-3">
        {filtered.map(res => (
          <motion.div
            key={res.id}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-2xl shadow-sm border p-4"
          >

            {/* TOP */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-slate-800">
                  {res.utilisateur?.prenom} {res.utilisateur?.nom}
                </p>
                <p className="text-xs text-slate-400">
                  ID #{res.id}
                </p>
              </div>

              <span className="text-xs px-2 py-1 rounded-full bg-slate-100">
                {res.statut}
              </span>
            </div>

            {/* DATE */}
            <div className="flex items-center gap-2 text-sm text-slate-600 mt-3">
              <Calendar size={14} />
              {format(res.dateReservation, getHeure(res.consultation))}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between items-center mt-4">

              <div className="flex gap-2">
                {res.statut === 'EN_ATTENTE' && (
                  <>
                    <button
                      onClick={() => updateStatus(res.id, 'VALIDE')}
                      className="text-green-600"
                    >
                      <CheckCircle size={18} />
                    </button>

                    <button
                      onClick={() => updateStatus(res.id, 'REFUSE')}
                      className="text-red-500"
                    >
                      <XCircle size={18} />
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setSelected(res)}
                className="text-indigo-600 text-sm font-medium"
              >
                Détails
              </button>
            </div>

          </motion.div>
        ))}
      </div>

      {/* MODAL DETAILS */}
      <AnimatePresence>
        {selected && (
          <div
            className="fixed inset-0 bg-black/40 flex items-end justify-center"
            onClick={() => setSelected(null)}
          >

            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="bg-white w-full max-w-md rounded-t-3xl p-5"
              onClick={e => e.stopPropagation()}
            >

              <div className="flex justify-between mb-3">
                <h2 className="font-bold">Détails</h2>
                <button onClick={() => setSelected(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-sm">

                <p>
                  <strong>Patient:</strong><br />
                  {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
                </p>

                <p>
                  <strong>Email:</strong><br />
                  {selected.utilisateur?.email}
                </p>

                <p>
                  <strong>Date:</strong><br />
                  {format(selected.dateReservation, getHeure(selected.consultation))}
                </p>

                {selected.consultation?.lienVisio && (
                  <a
                    href={selected.consultation.lienVisio}
                    target="_blank"
                    className="flex items-center gap-2 text-blue-600"
                  >
                    <Video size={14} />
                    Rejoindre la visio
                  </a>
                )}

              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full mt-5 bg-indigo-600 text-white py-2 rounded-xl"
              >
                Fermer
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ListeReservations;