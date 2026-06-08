import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faVideo
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
    if (!window.confirm(`Confirmer cette action ?`)) return;
    try {
      await updateReservationStatus(id, status);
      await chargerReservations();
    } catch {
      setError("Erreur mise à jour");
    }
  };

  // 🔥 FIX HEURE ROBUSTE
  const getHeure = (c) =>
    c?.heure ||
    c?.heureConsultation ||
    c?.heureDebut ||
    null;

  // 🔥 FORMAT PRO UI PSYCONNECT
  const formatPro = (date, heure) => {
    if (!date) return 'N/A';

    const safeHeure =
      heure ||
      date?.split('T')[1] ||
      '00:00';

    const dt = new Date(`${date}T${safeHeure}`);

    const h = dt.getHours().toString().padStart(2, '0');
    const m = dt.getMinutes().toString().padStart(2, '0');

    const jour = dt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    return `${h}h${m} • ${jour}`;
  };

  const filtered =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtreStatut);

  return (
    <div className="min-h-screen bg-slate-50 p-4">

      {/* HEADER */}
      <h1 className="text-xl font-bold mb-3">
        📅 Réservations
      </h1>

      {/* FILTRES */}
      <div className="flex gap-2 flex-wrap mb-4">
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFiltreStatut(s)}
            className={`px-3 py-1 rounded-full text-xs ${
              filtreStatut === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white border'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* LISTE CARDS */}
      <div className="space-y-3">
        {filtered.map(res => (
          <div
            key={res.id}
            className="bg-white p-4 rounded-2xl shadow-sm border"
          >

            {/* TOP */}
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">
                  {res.utilisateur?.prenom} {res.utilisateur?.nom}
                </p>
                <p className="text-xs text-gray-400">#{res.id}</p>
              </div>

              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                {res.statut}
              </span>
            </div>

            {/* DATE + HEURE PRO */}
            <p className="mt-2 text-sm text-gray-700 font-medium">
              🕒 {formatPro(
                res.dateReservation,
                getHeure(res.consultation)
              )}
            </p>

            {/* ACTIONS */}
            <div className="flex justify-between mt-4">

              <div className="flex gap-2">
                {res.statut === 'EN_ATTENTE' && (
                  <>
                    <button onClick={() => handleUpdateStatus(res.id, 'VALIDE')}>
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                    </button>

                    <button onClick={() => handleUpdateStatus(res.id, 'REFUSE')}>
                      <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setSelectedRes(res)}
                className="text-indigo-600 text-sm font-semibold"
              >
                Détails
              </button>

            </div>

          </div>
        ))}
      </div>

      {/* MODAL DETAILS */}
      {selectedRes && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end justify-center"
          onClick={() => setSelectedRes(null)}
        >
          <div
            className="bg-white w-full max-w-md p-5 rounded-t-3xl"
            onClick={e => e.stopPropagation()}
          >

            <h2 className="font-bold mb-3">Détails</h2>

            <p className="text-sm mb-2">
              👤 {selectedRes.utilisateur?.prenom} {selectedRes.utilisateur?.nom}
            </p>

            <p className="text-sm mb-2">
              📧 {selectedRes.utilisateur?.email}
            </p>

            <p className="text-sm mb-2">
              🕒 {formatPro(
                selectedRes.dateReservation,
                getHeure(selectedRes.consultation)
              )}
            </p>

            {selectedRes.consultation?.lienVisio && (
              <a
                href={selectedRes.consultation.lienVisio}
                target="_blank"
                className="text-blue-600 text-sm"
              >
                🎥 Rejoindre la visio
              </a>
            )}

            <button
              onClick={() => setSelectedRes(null)}
              className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-xl"
            >
              Fermer
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default ListeReservations;