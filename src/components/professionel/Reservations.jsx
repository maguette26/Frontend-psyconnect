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
  faFilter
} from '@fortawesome/free-solid-svg-icons';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const STATUT_CONFIG = {
  EN_ATTENTE: {
    label: 'En attente',
    icon: faClock,
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  VALIDE: {
    label: 'Validé',
    icon: faCheckCircle,
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  REFUSE: {
    label: 'Refusé',
    icon: faTimesCircle,
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
};

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
      console.error('Erreur lors du chargement des réservations :', err);
      setError('Erreur lors du chargement des réservations');
    }
  };

  const handleUpdateStatus = async (reservationId, status) => {
    if (
      !window.confirm(
        `Confirmer ${status === 'VALIDE' ? "l'acceptation" : 'le refus'} de cette réservation ?`
      )
    )
      return;
    try {
      await updateReservationStatus(reservationId, status);
      await chargerReservations();
    } catch (error) {
      console.error('Erreur mise à jour statut :', error);
      setError('Erreur lors de la mise à jour de la réservation');
    }
  };

  // ✅ FIX : format date + heure séparément, comme dans Consultations
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const dt = new Date(dateString);
      return dt.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // ✅ FIX : récupère l'heure directement depuis heureDebut (comme Consultations utilise `heure`)
  const formatHeure = (heureString) => {
    if (!heureString) return 'N/A';
    // Si le format est "HH:mm:ss", on garde juste "HH:mm"
    return heureString.length > 5 ? heureString.slice(0, 5) : heureString;
  };

  // ✅ FIX : récupère le nom de l'utilisateur comme Consultations (utilisateurNom / utilisateurPrenom)
  // Supporte les deux formats : objet imbriqué { utilisateur: { nom, prenom } } ou champs plats
  const getNomUtilisateur = (res) => {
    if (res.utilisateur) {
      return `${res.utilisateur.prenom ?? ''} ${res.utilisateur.nom ?? ''}`.trim();
    }
    return `${res.utilisateurPrenom ?? ''} ${res.utilisateurNom ?? ''}`.trim() || 'N/A';
  };

  const getEmailUtilisateur = (res) => {
    return res.utilisateur?.email ?? res.utilisateurEmail ?? 'Email inconnu';
  };

  const reservationsFiltrees =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter((res) => res.statut === filtreStatut);

  if (error)
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <FontAwesomeIcon icon={faTimesCircle} />
        <span>{error}</span>
      </div>
    );

  if (!reservations || reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FontAwesomeIcon icon={faCalendarCheck} size="3x" className="mb-4 opacity-30" />
        <p className="text-lg font-medium">Aucune réservation pour le moment</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header + filtres */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
          <FontAwesomeIcon icon={faCalendarCheck} />
          <span>Mes réservations</span>
          <span className="ml-2 text-sm font-normal text-gray-500">
            {reservationsFiltrees.length} résultat{reservationsFiltrees.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Filtres par statut (style pill comme Consultations) */}
        <div className="flex gap-2 flex-wrap items-center">
          <FontAwesomeIcon icon={faFilter} className="text-gray-400 text-sm" />
          {STATUTS.map((statut) => (
            <button
              key={statut}
              onClick={() => setFiltreStatut(statut)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-150 ${
                filtreStatut === statut
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {statut === 'TOUS'
                ? 'Toutes'
                : STATUT_CONFIG[statut]?.label ?? statut}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      {reservationsFiltrees.length === 0 ? (
        <p className="text-gray-500 italic text-center py-8">
          Aucune réservation pour ce statut.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead className="bg-blue-600">
              <tr>
                {['#', 'Utilisateur', 'Email', 'Date', 'Heure', 'Statut', 'Consultation', 'Actions'].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white text-sm divide-y divide-gray-100">
              {reservationsFiltrees.map((res, index) => {
                const cfg = STATUT_CONFIG[res.statut];
                return (
                  <tr
                    key={res.id}
                    className={`transition-colors duration-150 hover:bg-blue-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-blue-50/20'
                    }`}
                  >
                    {/* ID */}
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{res.id}</td>

                    {/* Utilisateur */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold shrink-0">
                          {getNomUtilisateur(res)
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase() || <FontAwesomeIcon icon={faUser} />}
                        </div>
                        <span className="font-medium text-gray-800 whitespace-nowrap">
                          {getNomUtilisateur(res)}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {getEmailUtilisateur(res)}
                    </td>

                    {/* ✅ Date seule */}
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap font-medium">
                      {formatDate(res.dateReservation)}
                    </td>

                    {/* ✅ Heure seule, extraite de heureDebut */}
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap font-medium">
                      {formatHeure(res.heureDebut)}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      {cfg ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}
                        >
                          <FontAwesomeIcon icon={cfg.icon} className="text-xs" />
                          {cfg.label}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">{res.statut}</span>
                      )}
                    </td>

                    {/* Consultation */}
                    <td className="px-4 py-3">
                      {res.statut === 'VALIDE' && res.consultation ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-700 flex items-center gap-1 text-xs">
                            <FontAwesomeIcon icon={faCalendarCheck} className="text-green-500" />
                            {formatDate(res.consultation.dateConsultation)}{' '}
                            {formatHeure(res.consultation.heure)}
                          </span>
                          {res.consultation.lienVisio && (
                            <a
                              href={res.consultation.lienVisio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                            >
                              <FontAwesomeIcon icon={faVideo} />
                              Rejoindre la visio
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {res.statut === 'EN_ATTENTE' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(res.id, 'VALIDE')}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200"
                              title="Accepter"
                              aria-label="Accepter la réservation"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(res.id, 'REFUSE')}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                              title="Refuser"
                              aria-label="Refuser la réservation"
                            >
                              <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            alert(
                              `Détails réservation ${res.id}\nUtilisateur: ${getNomUtilisateur(res)}\nEmail: ${getEmailUtilisateur(res)}\nDate: ${formatDate(res.dateReservation)} à ${formatHeure(res.heureDebut)}\nStatut: ${res.statut}`
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                          title="Détails"
                          aria-label="Voir les détails"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListeReservations;