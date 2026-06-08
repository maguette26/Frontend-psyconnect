import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
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
    if (proId) chargerReservations();
  }, [proId]);

  const chargerReservations = async () => {
    try {
      const data = await getReservations(proId);
      setReservations(data);
    } catch (err) {
      console.error("Erreur lors du chargement des réservations :", err);
      setError("Erreur lors du chargement des réservations");
    }
  };

  const handleUpdateStatus = async (reservationId, status) => {
    if (!window.confirm(`Confirmer ${status === 'VALIDE' ? "l'acceptation" : 'le refus'} de cette réservation ?`)) return;
    try {
      await updateReservationStatus(reservationId, status);
      await chargerReservations();
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
    } catch {
      return `${dateString} ${timeString || ''}`;
    }
  };

  const reservationsFiltrees =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(res => res.statut === filtreStatut);

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-4">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">📋 Réservations</h2>
        <p className="text-sm text-gray-500">Gestion des demandes patients</p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* FILTRES (mobile pills) */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
        {STATUTS.map(statut => (
          <button
            key={statut}
            onClick={() => setFiltreStatut(statut)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
              filtreStatut === statut
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-gray-600'
            }`}
          >
            {statut}
          </button>
        ))}
      </div>

      {/* LISTE */}
      <div className="space-y-3">
        {reservationsFiltrees.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Aucune réservation
          </div>
        ) : (
          reservationsFiltrees.map(res => (
            <div
              key={res.id}
              className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
            >

              {/* TOP */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">
                    {res.utilisateur?.prenom} {res.utilisateur?.nom}
                  </p>
                  <p className="text-xs text-gray-400">
                    {res.utilisateur?.email}
                  </p>
                </div>

                <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1
                  ${res.statut === 'VALIDE'
                    ? 'bg-green-100 text-green-700'
                    : res.statut === 'REFUSE'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={
                      res.statut === 'EN_ATTENTE'
                        ? faClock
                        : res.statut === 'VALIDE'
                        ? faCheckCircle
                        : faTimesCircle
                    }
                    className="text-xs"
                  />
                  {res.statut}
                </span>
              </div>

              {/* DATE */}
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                <FontAwesomeIcon icon={faCalendarCheck} />
                {formatDateTime(res.dateReservation, res.heureDebut)}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-4">

                {res.statut === 'EN_ATTENTE' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(res.id, 'VALIDE')}
                      className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-medium active:scale-95"
                    >
                      ✔ Accepter
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(res.id, 'REFUSE')}
                      className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium active:scale-95"
                    >
                      ✖ Refuser
                    </button>
                  </>
                )}

                <button
                  onClick={() =>
                    alert(
                      `Détails réservation ${res.id}\nUtilisateur: ${res.utilisateur?.nom} ${res.utilisateur?.prenom}\nStatut: ${res.statut}`
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600"
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </button>
              </div>

              {/* CONSULTATION */}
              {res.statut === 'VALIDE' && res.consultation && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    {formatDateTime(res.consultation.dateConsultation, res.consultation.heure)}
                  </div>

                  {res.consultation.lienVisio && (
                    <a
                      href={res.consultation.lienVisio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 mt-2 text-blue-600 font-medium"
                    >
                      <FontAwesomeIcon icon={faVideo} />
                      Rejoindre la visio
                    </a>
                  )}
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListeReservations;