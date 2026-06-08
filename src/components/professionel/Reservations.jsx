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
  faUser,
  faIdBadge
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
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des réservations");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm("Confirmer cette action ?")) return;
    await updateReservationStatus(id, status);
    await chargerReservations();
  };

  const formatTime = (date, time) => {
    if (!date) return 'N/A';
    const dt = new Date(`${date}T${time || '00:00'}`);
    return dt.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const reservationsFiltrees =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtreStatut);

  const getEmptyMessage = () => {
    if (filtreStatut === 'EN_ATTENTE') return "Aucune réservation en attente";
    if (filtreStatut === 'VALIDE') return "Aucune réservation validée";
    if (filtreStatut === 'REFUSE') return "Aucune réservation refusée";
    return "Aucune réservation disponible";
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">

      {/* FILTRES */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFiltreStatut(s)}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              filtreStatut === s
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">#</th>
              <th>Patient</th>
              <th>Date & Heure</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {reservationsFiltrees.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  {getEmptyMessage()}
                </td>
              </tr>
            ) : (
              reservationsFiltrees.map((r, index) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faIdBadge} />
                    #{r.id}
                  </td>

                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-1">
                        <FontAwesomeIcon icon={faUser} />
                        {r.utilisateur?.nom} {r.utilisateur?.prenom}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {r.utilisateur?.email}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <FontAwesomeIcon icon={faCalendarCheck} className="mr-1" />
                    {formatTime(r.dateReservation, r.heureReservation)}
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      r.statut === 'EN_ATTENTE'
                        ? 'bg-yellow-100 text-yellow-700'
                        : r.statut === 'VALIDE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {r.statut}
                    </span>
                  </td>

                  <td className="p-3 flex gap-2">
                    {r.statut === 'EN_ATTENTE' && (
                      <>
                        <button onClick={() => handleUpdateStatus(r.id, 'VALIDE')}>
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                        </button>
                        <button onClick={() => handleUpdateStatus(r.id, 'REFUSE')}>
                          <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
                        </button>
                      </>
                    )}

                    <button onClick={() => setSelected(r)}>
                      <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAILS */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-6 shadow-lg">

            <h2 className="text-lg font-bold mb-4">
              Détails réservation #{selected.id}
            </h2>

            <p><b>Patient:</b> {selected.utilisateur?.nom} {selected.utilisateur?.prenom}</p>
            <p><b>Email:</b> {selected.utilisateur?.email}</p>

            <p className="mt-2">
              <b>Date:</b> {selected.dateReservation}
            </p>

            <p>
              <b>Heure:</b> {selected.heureReservation || 'Non définie'}
            </p>

            <p>
              <b>Statut:</b> {selected.statut}
            </p>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ListeReservations;