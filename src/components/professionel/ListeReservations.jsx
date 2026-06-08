import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faTimesCircle, faVideo, faCalendarCheck,
  faInfoCircle, faClock, faUser, faEnvelope, faDollarSign,
  faCalendarAlt, faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

// ─── Helpers ──────────────────────────────────────────────
const formatDateTime = (dateString, timeString) => {
  if (!dateString) return 'N/A';
  try {
    const dt = new Date(`${dateString}T${timeString || '00:00'}:00`);
    return dt.toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return `${dateString} ${timeString || ''}`;
  }
};

const getInitials = (prenom, nom) =>
  `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase();

const statusConfig = {
  EN_ATTENTE: { label: 'En attente',  icon: faClock,        pill: 'bg-amber-100 text-amber-800' },
  VALIDE:     { label: 'Validé',      icon: faCheckCircle,  pill: 'bg-green-100 text-green-800' },
  REFUSE:     { label: 'Refusé',      icon: faTimesCircle,  pill: 'bg-red-100 text-red-800'     },
};

// ─── Modal confirmation ───────────────────────────────────
const ConfirmModal = ({ action, onConfirm, onCancel }) => {
  if (!action) return null;
  const isAccept = action.type === 'VALIDE';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${isAccept ? 'bg-green-100' : 'bg-red-100'}`}>
            <FontAwesomeIcon
              icon={isAccept ? faCheckCircle : faTimesCircle}
              className={isAccept ? 'text-green-600' : 'text-red-600'}
              size="lg"
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {isAccept ? 'Accepter la réservation ?' : 'Refuser la réservation ?'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isAccept
                ? "Cette action confirmera la réservation. L'utilisateur sera notifié."
                : 'Cette action refusera définitivement la réservation.'}
            </p>
          </div>
        </div>

        <div className="mx-6 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700">
          <p className="font-medium">{action.userName}</p>
          <p className="text-gray-500 text-xs mt-0.5">{action.date}</p>
        </div>

        <div className="flex gap-2 px-6 pb-5 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(action.id, action.type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isAccept
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isAccept ? "Confirmer l'acceptation" : 'Confirmer le refus'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal détails ────────────────────────────────────────
const DetailModal = ({ reservation, onClose }) => {
  if (!reservation) return null;
  const u = reservation.utilisateur || {};
  const cfg = statusConfig[reservation.statut] || {};

  const fields = [
    { icon: faInfoCircle,   label: 'Référence',      value: `#${reservation.id}` },
    { icon: faUser,         label: 'Client',          value: `${u.prenom || ''} ${u.nom || ''}` },
    { icon: faEnvelope,     label: 'Email',           value: u.email || 'N/A' },
    { icon: faCalendarAlt,  label: 'Date de demande', value: formatDateTime(reservation.dateReservation, reservation.heureDebut) },
    { icon: faDollarSign,   label: 'Prix',            value: reservation.prix ? `${reservation.prix} $` : 'N/A' },
    {
      icon: faCalendarCheck,
      label: 'Consultation',
      value: reservation.consultation
        ? formatDateTime(reservation.consultation.dateConsultation, reservation.consultation.heure)
        : 'Non créée',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Détails de la réservation</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pt-4 pb-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.pill || 'bg-gray-100 text-gray-700'}`}>
            {cfg.icon && <FontAwesomeIcon icon={cfg.icon} />}
            {cfg.label || reservation.statut}
          </span>
        </div>

        <div className="px-6 pb-4 space-y-1">
          {fields.map(({ icon, label, value }) => (
            <div key={label} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <FontAwesomeIcon icon={icon} className="text-gray-300 w-3.5" />
                {label}
              </span>
              <span className="text-sm text-gray-800 font-medium text-right max-w-[55%]">{value}</span>
            </div>
          ))}
        </div>

       {reservation.consultation?.lienVisio && (
  <div className="px-6 pb-5">
    <a
      href={reservation.consultation.lienVisio}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
    >
      <FontAwesomeIcon icon={faVideo} />
      Rejoindre la visio
    </a>
  </div>
)}

        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Carte réservation ────────────────────────────────────
const ReservationCard = ({ res, onAccept, onRefuse, onDetail }) => {
  const u = res.utilisateur || {};
  const cfg = statusConfig[res.statut] || {};

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:border-gray-200 hover:shadow-sm transition-all duration-150">
      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
        {getInitials(u.prenom, u.nom)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-900">{u.prenom} {u.nom}</p>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.pill || 'bg-gray-100 text-gray-700'}`}>
            {cfg.icon && <FontAwesomeIcon icon={cfg.icon} className="text-[10px]" />}
            {cfg.label || res.statut}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3">{u.email}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300" />
            {formatDateTime(res.dateReservation, res.heureDebut)}
          </span>
          {res.prix && (
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faDollarSign} className="text-gray-300" />
              {res.prix} $
            </span>
          )}
          {res.statut === 'VALIDE' && res.consultation && (
            <span className="flex items-center gap-1 text-green-600">
              <FontAwesomeIcon icon={faCalendarCheck} />
              {formatDateTime(res.consultation.dateConsultation, res.consultation.heure)}
            </span>
          )}
          {res.statut === 'VALIDE' && !res.consultation && (
            <span className="flex items-center gap-1 text-amber-500">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              Consultation non trouvée
            </span>
          )}
        </div>

        {res.consultation?.lienVisio && (
  <a
    href={res.consultation.lienVisio}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-600 hover:underline"
  >
    <FontAwesomeIcon icon={faVideo} />
    Rejoindre la visio
  </a>
)}
      </div>

      <div className="flex sm:flex-col gap-2 flex-shrink-0">
        {res.statut === 'EN_ATTENTE' && (
          <>
            <button
              onClick={() => onAccept(res)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-colors"
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              Accepter
            </button>
            <button
              onClick={() => onRefuse(res)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-colors"
            >
              <FontAwesomeIcon icon={faTimesCircle} />
              Refuser
            </button>
          </>
        )}
        <button
          onClick={() => onDetail(res)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100 transition-colors"
        >
          <FontAwesomeIcon icon={faInfoCircle} />
          Détails
        </button>
      </div>
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────
const ListeReservations = ({ proId }) => {
  const [reservations, setReservations]       = useState([]);
  const [error, setError]                     = useState('');
  const [filtreStatut, setFiltreStatut]       = useState('TOUS');
  const [confirmAction, setConfirmAction]     = useState(null);
  const [detailReservation, setDetailReservation] = useState(null);

  const chargerReservations = async () => {
    try {
      const data = await getReservations(proId);
      setReservations(data);
    } catch (err) {
      console.error('Erreur lors du chargement des réservations :', err);
      setError('Impossible de charger les réservations.');
    }
  };

  useEffect(() => {
    if (!proId) return;
    chargerReservations();
  }, [proId]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      await chargerReservations();
    } catch (err) {
      console.error('Erreur mise à jour statut :', err);
      setError('Erreur lors de la mise à jour de la réservation.');
    } finally {
      setConfirmAction(null);
    }
  };

  const openConfirm = (res, type) => {
    const u = res.utilisateur || {};
    setConfirmAction({
      id: res.id,
      type,
      userName: `${u.prenom || ''} ${u.nom || ''}`.trim(),
      date: formatDateTime(res.dateReservation, res.heureDebut),
    });
  };

  const reservationsFiltrees = filtreStatut === 'TOUS'
    ? reservations
    : reservations.filter((r) => r.statut === filtreStatut);

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 text-sm">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 rounded-2xl p-5">
        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-1">
            Statut :
          </span>
          {STATUTS.map((s) => (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                filtreStatut === s
                  ? 'bg-white text-gray-900 border-gray-200 shadow-sm'
                  : 'text-gray-500 border-transparent hover:border-gray-200 hover:bg-white'
              }`}
            >
              {s === 'TOUS' ? 'Tous' : statusConfig[s]?.label || s}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">
            {reservationsFiltrees.length} réservation{reservationsFiltrees.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Liste */}
        {reservationsFiltrees.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <FontAwesomeIcon icon={faCalendarAlt} size="2x" className="mb-3 opacity-30" />
            <p>Aucune réservation{filtreStatut !== 'TOUS' ? ' pour ce statut' : ''}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservationsFiltrees.map((res) => (
              <ReservationCard
                key={res.id}
                res={res}
                onAccept={(r) => openConfirm(r, 'VALIDE')}
                onRefuse={(r) => openConfirm(r, 'REFUSE')}
                onDetail={setDetailReservation}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        action={confirmAction}
        onConfirm={handleUpdateStatus}
        onCancel={() => setConfirmAction(null)}
      />
      <DetailModal
        reservation={detailReservation}
        onClose={() => setDetailReservation(null)}
      />
    </>
  );
};

export default ListeReservations;