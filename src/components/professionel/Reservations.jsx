import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import {
  faCheckCircle,
  faTimesCircle,
  faVideo,
  faCalendarCheck,
  faInfoCircle,
  faClock,
  faUser,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

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
      setError("Erreur lors du chargement");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm("Confirmer cette action ?")) return;
    await updateReservationStatus(id, status);
    await chargerReservations();
  };

  const formatDate = (date, heure) => {
    if (!date) return 'N/A';
    const dt = new Date(`${date}T${heure || '00:00'}:00`);
    return {
      date: dt.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }),
      heure: dt.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const filtered =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtreStatut);

  return (
    <div className="p-4 max-w-4xl mx-auto">

      {/* FILTRES CLEAN */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFiltreStatut(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filtreStatut === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* LISTE CARD STYLE */}
      <div className="space-y-3">
        {filtered.map(res => {
          const dt = formatDate(res.dateReservation, res.heureDebut);

          return (
            <div
              key={res.id}
              className="bg-white rounded-2xl shadow p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {res.utilisateur?.prenom} {res.utilisateur?.nom}
                </p>

                <p className="text-sm text-gray-500">
                  {dt.date} à {dt.heure}
                </p>
              </div>

              <div className="flex gap-2 items-center">

                {res.statut === 'EN_ATTENTE' && (
                  <>
                    <button onClick={() => handleUpdateStatus(res.id, 'VALIDE')}>
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                    </button>

                    <button onClick={() => handleUpdateStatus(res.id, 'REFUSE')}>
                      <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
                    </button>
                  </>
                )}

                <button onClick={() => setSelected(res)}>
                  <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PRO CENTRÉ */}
      <AnimatePresence>
        {selected && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl"
            >

              <h2 className="text-lg font-bold mb-4">
                Détails de la réservation
              </h2>

              <div className="space-y-3 text-sm">

                <p className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} />
                  {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
                </p>

                <p className="flex items-center gap-2 text-gray-600">
                  <FontAwesomeIcon icon={faEnvelope} />
                  {selected.utilisateur?.email || "Email indisponible"}
                </p>

                <p className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  {formatDate(selected.dateReservation, selected.heureDebut).date}
                </p>

                <p className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} />
                  {formatDate(selected.dateReservation, selected.heureDebut).heure}
                </p>

                {selected.consultation?.lienVisio && (
                  <a
                    href={selected.consultation.lienVisio}
                    target="_blank"
                    className="text-indigo-600 flex items-center gap-2 mt-2"
                  >
                    <FontAwesomeIcon icon={faVideo} />
                    Rejoindre la visio
                  </a>
                )}

              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-5 w-full bg-indigo-600 text-white py-2 rounded-lg"
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