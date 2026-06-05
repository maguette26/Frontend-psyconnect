import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { CheckCircle, XCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Reservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [filtre, setFiltre] = useState('TOUTES');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await getReservations(proId);
      setReservations(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des réservations.");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proId) {
      fetchReservations();
    } else {
      setLoading(false);
      setError("ID professionnel manquant.");
    }
  }, [proId]);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateReservationStatus(id, status);
      await fetchReservations();
      if (status === 'VALIDE') {
        toast.success("La réservation a été validée.");
      } else if (status === 'REFUSE') {
        toast.error("La réservation a été refusée.");
      }
    } catch (err) {
      setError("Erreur lors de la mise à jour du statut.");
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setUpdatingId(null);
    }
  };

  const mapStatutValidation = (reservation) => {
    if (reservation.statut === 'PAYEE' || reservation.statut === 'EN_ATTENTE_PAIEMENT') {
      return 'VALIDE';
    }
    if (reservation.statut === 'REFUSE' || reservation.statut === 'ANNULEE') {
      return 'REFUSE';
    }
    return 'EN_ATTENTE';
  };

  const formatHeure = (heure) => {
    if (!heure) return '';
    const [h, m] = heure.split(':');
    return `${h}h${m}`;
  };

  const getStatutMessage = (statut) => {
    switch (statut) {
      case 'VALIDE':
        return <span className="text-green-600 font-semibold">Validée</span>;
      case 'REFUSE':
        return <span className="text-red-600 font-semibold">Refusée</span>;
      default:
        return <span className="text-gray-600 font-semibold">En attente</span>;
    }
  };

  const reservationsFiltrees = reservations.filter((r) =>
    filtre === 'TOUTES' ? true : mapStatutValidation(r) === filtre
  );

  const renderActions = (id, statut) => {
    const btnStyle = "p-0 m-0 bg-transparent border-none focus:outline-none hover:scale-110 transition-transform";

    switch (statut) {
      case 'EN_ATTENTE':
        return (
          <>
            <button
              onClick={() => handleUpdateStatus(id, 'VALIDE')}
              className={`${btnStyle} text-green-600`}
              title="Valider"
              disabled={updatingId === id}
            >
              <CheckCircle size={20} />
            </button>
            <button
              onClick={() => handleUpdateStatus(id, 'REFUSE')}
              className={`${btnStyle} text-red-600`}
              title="Refuser"
              disabled={updatingId === id}
            >
              <XCircle size={20} />
            </button>
          </>
        );
      case 'VALIDE':
        return (
          <button
            onClick={() => handleUpdateStatus(id, 'REFUSE')}
            className={`${btnStyle} text-red-600`}
            title="Refuser"
            disabled={updatingId === id}
          >
            <XCircle size={20} />
          </button>
        );
      case 'REFUSE':
        return (
          <button
            onClick={() => handleUpdateStatus(id, 'VALIDE')}
            className={`${btnStyle} text-green-600`}
            title="Valider"
            disabled={updatingId === id}
          >
            <CheckCircle size={20} />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
        <CheckCircle size={24} /> Mes réservations
      </h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4 flex gap-2 flex-wrap">
        {['TOUTES', 'EN_ATTENTE', 'VALIDE', 'REFUSE'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-150 ${
              filtre === f
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'TOUTES'
              ? 'Toutes'
              : f === 'EN_ATTENTE'
              ? 'En attente'
              : f === 'VALIDE'
              ? 'Validées'
              : 'Refusées'}
          </button>
        ))}
      </div>

      {reservationsFiltrees.length === 0 ? (
        <p className="text-gray-500">Vous n'avez aucune réservation pour le moment</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Heure</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Statut</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm">
              {reservationsFiltrees.map((reservation, index) => {
                const statutMapped = mapStatutValidation(reservation);
                return (
                  <tr
                    key={reservation.id}
                    className={`border-t transition-all duration-150 ${
                      index % 2 === 0 ? 'bg-blue-50/20' : 'bg-white'
                    } hover:bg-blue-50`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {new Date(reservation.dateReservation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {formatHeure(reservation.heureConsultation)}
                    </td>
                    <td className="px-4 py-3">{getStatutMessage(statutMapped)}</td>
                    <td className="px-4 py-3 flex gap-2 items-center">{renderActions(reservation.id, statutMapped)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Reservations;