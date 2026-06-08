import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faVideo,
  faCalendarCheck,
  faInfoCircle,
  faClock,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('TOUS');

  // ✅ NEW: modal details
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

  const handleUpdateStatus = async (reservationId, status) => {
    if (!window.confirm(`Confirmer ${status === 'VALIDE' ? "l'acceptation" : 'le refus'} ?`)) return;
    try {
      await updateReservationStatus(reservationId, status);
      await chargerReservations();
    } catch {
      setError("Erreur lors de la mise à jour");
    }
  };

  const formatDateTime = (d, t) => {
    if (!d) return 'N/A';
    const dt = new Date(`${d}T${t || '00:00'}:00`);
    return dt.toLocaleString('fr-FR');
  };

  const reservationsFiltrees =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtreStatut);

  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="max-w-full bg-white p-4 rounded-lg">

      {/* FILTRES */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFiltreStatut(s)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filtreStatut === s ? 'bg-indigo-600 text-white' : 'bg-gray-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th>ID</th>
              <th>Utilisateur</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {reservationsFiltrees.map(res => (
              <tr key={res.id} className="border-t hover:bg-gray-50">
                <td className="py-2">{res.id}</td>

                <td>
                  {res.utilisateur?.prenom} {res.utilisateur?.nom}
                </td>

                <td>{formatDateTime(res.dateReservation, res.heureDebut)}</td>

                <td>{res.statut}</td>

                <td className="flex gap-3 py-2">

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

                  {/* ✅ DETAILS (remplacé alert) */}
                  <button onClick={() => setSelectedRes(res)}>
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL FRAMER ================= */}
      <AnimatePresence>
        {selectedRes && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
               onClick={() => setSelectedRes(null)}>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Détails de la réservation </h2>
                <button onClick={() => setSelectedRes(null)}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {/* CONTENT */}
              <div className="space-y-3 text-sm">

                <div>
                  <p className="text-gray-500">Utilisateur</p>
                  <p>{selectedRes.utilisateur?.prenom} {selectedRes.utilisateur?.nom}</p>
                </div>

                <div>
                  <p className="text-gray-500">Email</p>
                  <p>{selectedRes.utilisateur?.email}</p>
                </div>

                <div>
                  <p className="text-gray-500">Date</p>
                  <p>{formatDateTime(selectedRes.dateReservation, selectedRes.heureDebut)}h</p>
                </div>

                <div>
                  <p className="text-gray-500">Statut</p>
                  <p>{selectedRes.statut}</p>
                </div>

                {selectedRes.consultation && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-semibold text-green-700">Consultation</p>
                    <p>{formatDateTime(selectedRes.consultation.dateConsultation, selectedRes.consultation.heure)}</p>

                    {selectedRes.consultation.lienVisio && (
                      <a
                        href={selectedRes.consultation.lienVisio}
                        target="_blank"
                        className="text-blue-600 underline text-sm"
                      >
                        Rejoindre le chat
                      </a>
                    )}
                  </div>
                )}

              </div>

              {/* FOOTER */}
              <button
                onClick={() => setSelectedRes(null)}
                className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-xl"
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