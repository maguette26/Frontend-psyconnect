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
  const [selectedRes, setSelectedRes] = useState(null);

  useEffect(() => {
    if (proId) chargerReservations();
  }, [proId]);

  const chargerReservations = async () => {
    try {
      const data = await getReservations(proId);
      setReservations(data);
    } catch (err) {
      setError("Erreur lors du chargement des réservations");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Confirmer ${status === 'VALIDE' ? "acceptation" : "refus"} ?`)) return;
    try {
      await updateReservationStatus(id, status);
      await chargerReservations();
    } catch {
      setError("Erreur mise à jour");
    }
  };

  // ✅ FIX HEURE PROPRE
  const formatDateTime = (date, heure) => {
    if (!date) return 'N/A';
    const h = heure && heure !== "00:00" ? heure : null;

    const dt = new Date(`${date}T${h || '00:00'}:00`);

    return {
      date: dt.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      heure: h ? h : dt.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const filtrees =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtreStatut);

  return (
    <div className="p-4">

      {/* FILTRES (version propre comme avant) */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFiltreStatut(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filtreStatut === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* LISTE */}
      <div className="space-y-3">
        {filtrees.map(res => {
          const dt = formatDateTime(res.dateReservation, res.heureDebut);

          return (
            <div key={res.id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">

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
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                    </button>

                    <button onClick={() => handleUpdateStatus(res.id, 'REFUSE')}>
                      <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
                    </button>
                  </>
                )}

                <button onClick={() => setSelectedRes(res)}>
                  <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ MODAL CENTRÉ PRO */}
      <AnimatePresence>
        {selectedRes && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRes(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6"
            >

              <h2 className="text-lg font-bold mb-4">
                Détails de la réservation
              </h2>

              {/* USER */}
              <div className="space-y-2 text-sm">

                <p className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} />
                  {selectedRes.utilisateur?.prenom} {selectedRes.utilisateur?.nom}
                </p>

                <p className="flex items-center gap-2 text-gray-600">
                  <FontAwesomeIcon icon={faEnvelope} />
                  {selectedRes.utilisateur?.email || "Email non disponible"}
                </p>

                <p className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  {formatDateTime(selectedRes.dateReservation, selectedRes.heureDebut).date}
                </p>

                <p className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} />
                  {formatDateTime(selectedRes.dateReservation, selectedRes.heureDebut).heure}
                </p>

              </div>

              <button
                onClick={() => setSelectedRes(null)}
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg"
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