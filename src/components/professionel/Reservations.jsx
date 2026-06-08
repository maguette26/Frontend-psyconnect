import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faClock,
  faUser,
  faCalendarDays
} from '@fortawesome/free-solid-svg-icons';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (proId) chargerReservations();
  }, [proId]);

  const chargerReservations = async () => {
    try {
      const data = await getReservations(proId);
      setReservations(data);
    } catch (err) {
      console.error(err);
      setError("Erreur chargement réservations");
    }
  };

  const handleStatus = async (id, status) => {
    if (!window.confirm("Confirmer cette action ?")) return;
    await updateReservationStatus(id, status);
    await chargerReservations();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return "Non définie";
    return time;
  };

  const filtered =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtreStatut);

  const emptyMessage = () => {
    if (filtreStatut === 'EN_ATTENTE') return "Aucune réservation en attente";
    if (filtreStatut === 'VALIDE') return "Aucune réservation validée";
    if (filtreStatut === 'REFUSE') return "Aucune réservation refusée";
    return "Aucune réservation";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* FILTRES */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFiltreStatut(s)}
            className={`px-4 py-2 rounded-full border text-sm transition ${
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
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">#</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-500">
                  {emptyMessage()}
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="border-t hover:bg-gray-50">

                  {/* ID */}
                  <td className="p-3 font-semibold text-gray-700">
                    #{r.id}
                  </td>

                  {/* PATIENT */}
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 font-medium">
                        <FontAwesomeIcon icon={faUser} className="text-blue-500" />
                        {r.utilisateur?.prenom} {r.utilisateur?.nom}
                      </span>
                      <span className="text-xs text-gray-500">
                        {r.utilisateur?.email}
                      </span>
                    </div>
                  </td>

                  {/* DATE */}
                  <td className="p-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarDays} className="text-gray-500" />
                    {formatDate(r.dateReservation)}
                  </td>

                  {/* HEURE (FIX IMPORTANT) */}
                  <td className="p-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                    {formatTime(r.heureDebut)}
                  </td>

                  {/* STATUT */}
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.statut === 'EN_ATTENTE'
                        ? 'bg-yellow-100 text-yellow-700'
                        : r.statut === 'VALIDE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {r.statut}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 flex gap-2">

                    {r.statut === 'EN_ATTENTE' && (
                      <>
                        <button onClick={() => handleStatus(r.id, 'VALIDE')}>
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-lg" />
                        </button>

                        <button onClick={() => handleStatus(r.id, 'REFUSE')}>
                          <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-lg" />
                        </button>
                      </>
                    )}

                    <button onClick={() => setSelected(r)}>
                      <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 text-lg" />
                    </button>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CENTRÉ PRO */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white w-[90%] max-w-md rounded-xl p-6 shadow-xl">

            <h2 className="text-xl font-bold mb-4 text-blue-600">
              Détails Réservation #{selected.id}
            </h2>

            <div className="space-y-2 text-sm">

              <p>
                <b>Patient :</b> {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
              </p>

              <p>
                <b>Email :</b> {selected.utilisateur?.email}
              </p>

              <p>
                <b>Date :</b> {formatDate(selected.dateReservation)}
              </p>

              <p>
                <b>Heure :</b> {formatTime(selected.heureDebut)}
              </p>

              <p>
                <b>Statut :</b> {selected.statut}
              </p>

            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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