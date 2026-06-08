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
  faFilter,
  faEnvelope,
  faXmark,
  faBan,
  faCreditCard,
} from '@fortawesome/free-solid-svg-icons';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'EN_ATTENTE_PAIEMENT', 'PAYEE', 'REFUSE', 'ANNULEE'];

const STATUT_CONFIG = {
  EN_ATTENTE: {
    label: 'En attente',
    icon: faClock,
    pill: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  EN_ATTENTE_PAIEMENT: {
    label: 'Attente paiement',
    icon: faCreditCard,
    pill: 'bg-orange-50 text-orange-700 border border-orange-200',
  },
  PAYEE: {
    label: 'Payée',
    icon: faCheckCircle,
    pill: 'bg-green-50 text-green-700 border border-green-200',
  },
  REFUSE: {
    label: 'Refusée',
    icon: faTimesCircle,
    pill: 'bg-red-50 text-red-700 border border-red-200',
  },
  ANNULEE: {
    label: 'Annulée',
    icon: faBan,
    pill: 'bg-gray-100 text-gray-500 border border-gray-200',
  },
};

// ── helpers ──────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const formatHeure = (h) => {
  if (!h) return 'N/A';
  return h.length > 5 ? h.slice(0, 5) : h;
};

const getNom = (res) => {
  if (res.utilisateur)
    return `${res.utilisateur.prenom ?? ''} ${res.utilisateur.nom ?? ''}`.trim();
  return `${res.utilisateurPrenom ?? ''} ${res.utilisateurNom ?? ''}`.trim() || 'N/A';
};

const getEmail = (res) =>
  res.utilisateur?.email ?? res.utilisateurEmail ?? 'Email inconnu';

const getInitiales = (nom) =>
  nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

// ── Modal détails ─────────────────────────────────────────
const ReservationModal = ({ reservation: res, onClose }) => {
  if (!res) return null;
  const cfg = STATUT_CONFIG[res.statut];
  const nom = getNom(res);
  const email = getEmail(res);

  return (
    // Overlay — fixed via portail simulé, mais on évite position:fixed
    // On utilise un conteneur full-screen en flow avec z-index
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
              {getInitiales(nom)}
            </div>
            <div>
              <p className="text-white font-semibold">{nom}</p>
              <p className="text-blue-100 text-xs">{email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition"
            aria-label="Fermer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Statut */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Statut</span>
            {cfg ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.pill}`}>
                <FontAwesomeIcon icon={cfg.icon} className="text-xs" />
                {cfg.label}
              </span>
            ) : (
              <span className="text-xs text-gray-400">{res.statut}</span>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Date & heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Date</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(res.dateReservation)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Heure</p>
              <p className="text-sm font-medium text-gray-800">{formatHeure(res.heureDebut)}</p>
            </div>
          </div>

          {/* Consultation si PAYEE */}
          {res.statut === 'PAYEE' && res.consultation && (
            <>
              <hr className="border-gray-100" />
              <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Consultation</p>
                <div className="bg-green-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    <span>
                      {formatDate(res.consultation.dateConsultation)} à{' '}
                      {formatHeure(res.consultation.heure)}
                    </span>
                  </div>
                  {res.consultation.lienVisio && (
                    <a
                      href={res.consultation.lienVisio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <FontAwesomeIcon icon={faVideo} />
                      Rejoindre la visio
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ID technique */}
          <hr className="border-gray-100" />
          <p className="text-xs text-gray-300 font-mono">ID #{res.id}</p>
        </div>

        {/* Footer actions */}
        {res.statut === 'EN_ATTENTE' && (
          <div className="px-6 pb-5 flex gap-3">
            <button
              onClick={() => { onClose(); }}
              className="flex-1 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition flex items-center justify-center gap-2"
              // L'action réelle est gérée dans le tableau — ce bouton ferme et laisse l'utilisateur cliquer dans le tableau
              // Pour une meilleure UX on peut aussi passer onAccept/onRefuse en props
            >
              <FontAwesomeIcon icon={faCheckCircle} /> Accepter
            </button>
            <button
              onClick={() => { onClose(); }}
              className="flex-1 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faTimesCircle} /> Refuser
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Composant principal ───────────────────────────────────
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
      console.error('Erreur chargement réservations :', err);
      setError('Erreur lors du chargement des réservations');
    }
  };

  const handleUpdateStatus = async (reservationId, status) => {
    if (!window.confirm(`Confirmer ${status === 'PAYEE' ? "l'acceptation" : 'le refus'} ?`)) return;
    try {
      await updateReservationStatus(reservationId, status);
      await chargerReservations();
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  };

  const reservationsFiltrees =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter((r) => r.statut === filtreStatut);

  if (error)
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <FontAwesomeIcon icon={faTimesCircle} />
        <span>{error}</span>
      </div>
    );

  if (!reservations.length)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FontAwesomeIcon icon={faCalendarCheck} size="3x" className="mb-4 opacity-30" />
        <p className="text-lg font-medium">Aucune réservation pour le moment</p>
      </div>
    );

  return (
    <>
      {/* Modal */}
      {selectedRes && (
        <ReservationModal
          reservation={selectedRes}
          onClose={() => setSelectedRes(null)}
        />
      )}

      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
            <FontAwesomeIcon icon={faCalendarCheck} />
            <span>Mes réservations</span>
            <span className="ml-2 text-sm font-normal text-gray-400">
              {reservationsFiltrees.length} résultat{reservationsFiltrees.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Filtres pill */}
          <div className="flex gap-2 flex-wrap items-center">
            <FontAwesomeIcon icon={faFilter} className="text-gray-400 text-sm" />
            {STATUTS.map((s) => (
              <button
                key={s}
                onClick={() => setFiltreStatut(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filtreStatut === s
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'TOUS' ? 'Toutes' : (STATUT_CONFIG[s]?.label ?? s)}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau */}
        {reservationsFiltrees.length === 0 ? (
          <p className="text-gray-400 italic text-center py-10">
            Aucune réservation pour ce statut.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-blue-600">
                <tr>
                  {['Utilisateur', 'Email', 'Date', 'Heure', 'Statut', 'Consultation', 'Actions'].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white whitespace-nowrap">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {reservationsFiltrees.map((res, index) => {
                  const cfg = STATUT_CONFIG[res.statut];
                  const nom = getNom(res);
                  return (
                    <tr
                      key={res.id}
                      className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      {/* Utilisateur */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitiales(nom)}
                          </div>
                          <span className="font-medium text-gray-800 whitespace-nowrap">{nom}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faEnvelope} className="text-gray-300 text-xs" />
                          {getEmail(res)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                        {formatDate(res.dateReservation)}
                      </td>

                      {/* Heure */}
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                        {formatHeure(res.heureDebut)}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        {cfg ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.pill}`}>
                            <FontAwesomeIcon icon={cfg.icon} className="text-xs" />
                            {cfg.label}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">{res.statut}</span>
                        )}
                      </td>

                      {/* Consultation */}
                      <td className="px-4 py-3">
                        {res.statut === 'PAYEE' && res.consultation ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-gray-600 text-xs flex items-center gap-1">
                              <FontAwesomeIcon icon={faCalendarCheck} className="text-green-500" />
                              {formatDate(res.consultation.dateConsultation)} {formatHeure(res.consultation.heure)}
                            </span>
                            {res.consultation.lienVisio && (
                              <a href={res.consultation.lienVisio} target="_blank" rel="noopener noreferrer"
                                className="text-blue-500 hover:underline text-xs flex items-center gap-1">
                                <FontAwesomeIcon icon={faVideo} /> Visio
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {res.statut === 'EN_ATTENTE' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(res.id, 'PAYEE')}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition"
                                title="Accepter" aria-label="Accepter"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(res.id, 'REFUSE')}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition"
                                title="Refuser" aria-label="Refuser"
                              >
                                <FontAwesomeIcon icon={faTimesCircle} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedRes(res)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition"
                            title="Détails" aria-label="Voir les détails"
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
    </>
  );
};

export default ListeReservations;