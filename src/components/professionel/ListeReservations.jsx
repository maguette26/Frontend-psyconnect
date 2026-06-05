import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faVideo,
  faCalendarCheck,
  faInfoCircle,
  faClock
} from '@fortawesome/free-solid-svg-icons';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('TOUS');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`http://localhost:9191/api/reservations/pro/${proId}`);
        setReservations(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des réservations :", err);
        setError("Erreur lors du chargement des réservations");
      }
    };

    if (proId) {
      fetchReservations();
    }
  }, [proId]);

  const handleUpdateStatus = async (reservationId, status) => {
    if (!window.confirm(`Confirmer ${status === 'VALIDE' ? "l'acceptation" : 'le refus'} de cette réservation ?`)) {
      return;
    }

    try {
      await axios.put(`http://localhost:9191/api/reservations/${reservationId}/statut`, { statut: status });
      const updated = await axios.get(`http://localhost:9191/api/reservations/pro/${proId}`);
      setReservations(updated.data);
    } catch (error) {
      console.error("Erreur mise à jour statut :", error);
      setError("Erreur lors de la mise à jour de la réservation");
    }
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'N/A';
    try {
      const dt = new Date(`${dateString}T${timeString || '00:00'}:00`);
      return dt.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return `${dateString} ${timeString || ''}`;
    }
  };

  const reservationsFiltrees = filtreStatut === 'TOUS'
    ? reservations
    : reservations.filter(res => res.statut === filtreStatut);

  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!reservations || reservations.length === 0) {
    return <p className="text-gray-600 p-4 bg-gray-50 rounded-md">Aucune réservation trouvée pour le moment.</p>;
  }

  return (
    <div className="max-w-full overflow-x-auto shadow-lg rounded-lg bg-white p-4">
      {/* Filtre Statut */}
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="filtreStatut" className="font-semibold text-gray-700">
          Filtrer par statut :
        </label>
        <select
          id="filtreStatut"
          value={filtreStatut}
          onChange={e => setFiltreStatut(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUTS.map(statut => (
            <option key={statut} value={statut}>{statut === 'TOUS' ? 'Tous' : statut}</option>
          ))}
        </select>
        <span className="text-gray-600 italic text-sm">
          {reservationsFiltrees.length} réservation{reservationsFiltrees.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <table className="min-w-full divide-y divide-gray-200 rounded-lg">
        <thead className="bg-gray-50 rounded-t-lg">
          <tr>
            {['ID Réservation', 'Utilisateur', 'Date & Heure Dem.', 'Statut', 'Consultation Prévue', 'Actions'].map(header => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reservationsFiltrees.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500 italic">
                Aucune réservation correspondante.
              </td>
            </tr>
          ) : (
            reservationsFiltrees.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">{res.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{res.utilisateur?.nom} {res.utilisateur?.prenom} ({res.utilisateur?.email})</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(res.dateReservation, res.heureDebut)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${res.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                        res.statut === 'VALIDE' ? 'bg-green-100 text-green-800' :
                        res.statut === 'REFUSE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                    <FontAwesomeIcon icon={
                      res.statut === 'EN_ATTENTE' ? faClock :
                      res.statut === 'VALIDE' ? faCheckCircle :
                      res.statut === 'REFUSE' ? faTimesCircle :
                      faInfoCircle
                    } className="mr-1" />
                    {res.statut}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {res.statut === 'VALIDE' && res.consultation ? (
                    <>
                      <p><FontAwesomeIcon icon={faCalendarCheck} className="mr-1" />
                        {formatDateTime(res.consultation.dateConsultation, res.consultation.heure)}
                      </p>
                      {res.consultation.lienVisio && (
                        <a href={res.consultation.lienVisio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center mt-1">
                          <FontAwesomeIcon icon={faVideo} className="mr-1" /> Rejoindre la visio
                        </a>
                      )}
                    </>
                  ) : res.statut === 'VALIDE' && !res.consultation ? (
                    <p className="text-red-500">Consultation non trouvée</p>
                  ) : (
                    <p className="text-gray-500">N/A</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-3">
                  {res.statut === 'EN_ATTENTE' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(res.id, 'VALIDE')}
                        className="text-green-600 hover:text-green-900 focus:outline-none focus:ring-0 cursor-pointer"
                        title="Accepter la réservation"
                        aria-label="Accepter la réservation"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(res.id, 'REFUSE')}
                        className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-0 cursor-pointer"
                        title="Refuser la réservation"
                        aria-label="Refuser la réservation"
                      >
                        <FontAwesomeIcon icon={faTimesCircle} size="lg" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() =>
                      alert(`Détails de la réservation ${res.id}:\nUtilisateur: ${res.utilisateur?.nom} ${res.utilisateur?.prenom}\nDate Demande: ${formatDateTime(res.dateReservation, res.heureDebut)}\nStatut: ${res.statut}\nPrix: ${res.prix ? `${res.prix} $` : 'N/A'}\nConsultation: ${res.consultation ? `Date: ${formatDateTime(res.consultation.dateConsultation, res.consultation.heure)}, Prix: ${res.consultation.prix || 'N/A'} $` : 'Non créée'}`)}
                    className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-0 cursor-pointer"
                    title="Voir les détails"
                    aria-label="Voir les détails"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} size="lg" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListeReservations;
