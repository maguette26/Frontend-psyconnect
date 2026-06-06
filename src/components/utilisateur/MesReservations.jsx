import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CalendarCheck, Clock, Euro, TicketCheck, SlidersHorizontal, XCircle, Stethoscope } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

const formatHeure = (heureStr) => {
  if (!heureStr) return '—';
  return heureStr.substring(0, 5);
};

const statutConfig = {
  EN_ATTENTE:          { label: '🕒 En attente',            color: 'bg-indigo-100 text-indigo-700' },
  EN_ATTENTE_PAIEMENT: { label: '💳 En attente de paiement', color: 'bg-yellow-100 text-yellow-700' },
  PAYEE:               { label: '✅ Payée',                  color: 'bg-green-100 text-green-700'  },
  ANNULEE:             { label: '❌ Annulée',                color: 'bg-red-100 text-red-700'      },
  REFUSE:              { label: '🚫 Refusée',               color: 'bg-gray-100 text-gray-600'    },
};

const StatutBadge = ({ statut }) => {
  const config = statutConfig[statut] || { label: statut, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="flex items-center gap-2 text-gray-500">{icon} {label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

const MesReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [statut, setStatut]             = useState('');
  const [error, setError]               = useState(null);
  const [selected, setSelected]         = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get('/reservations/mes-reservations');
        setReservations(response.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchReservations();
  }, []);

  const handleDownloadTicket = async (id) => {
    try {
      const response = await api.get(`/reservations/telecharger-recu/${id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = `recu_reservation_${id}.pdf`;
      link.click();
      toast.success('🎟️ Ticket téléchargé avec succès !');
    } catch {
      toast.error("Erreur lors du téléchargement !");
    }
  };

  const handleAnnulerReservation = async (reservation) => {
    try {
      await api.delete(`/reservations/annuler/${reservation.id}`);
      toast.success("Réservation annulée avec succès !");
      setReservations((prev) => prev.filter(r => r.id !== reservation.id));
      setSelected(null);
    } catch {
      toast.error("Erreur lors de l'annulation !");
    }
  };

  const filteredReservations = reservations.filter((res) => {
    if (!statut) return res.statut !== 'ANNULEE';
    return res.statut === statut;
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <motion.h2
          className="text-4xl font-extrabold text-indigo-700 flex items-center gap-3"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <CalendarCheck size={32} /> Mes Réservations
        </motion.h2>

        <div className="flex gap-3 items-center">
          <SlidersHorizontal className="text-gray-500" />
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="border border-indigo-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">🕒 En attente</option>
            <option value="EN_ATTENTE_PAIEMENT">💳 En attente de paiement</option>
            <option value="PAYEE">✅ Payée</option>
            <option value="ANNULEE">❌ Annulée</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 text-center mb-6">{error}</p>}

      {filteredReservations.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-16">Aucune réservation trouvée.</p>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {filteredReservations.map((res) => (
              <motion.li
                key={res.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                onClick={() => setSelected(res)}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">Dr {res.professionnelNom}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Réservé le {formatDate(res.dateReservation)} · {formatHeure(res.heureReservation)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:ml-auto">
                    <StatutBadge statut={res.statut} />
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Euro size={14} />{res.prix} €
                    </span>
                    <span className="text-xs text-indigo-500 font-medium underline">Voir détails →</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Modal détail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              >
                <XCircle size={24} />
              </button>

              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                  <Stethoscope size={30} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Dr {selected.professionnelNom}</h3>
                <StatutBadge statut={selected.statut} />
              </div>

              <div className="space-y-1">
                <InfoRow icon={<CalendarCheck size={16} />} label="Date réservation"   value={formatDate(selected.dateReservation)} />
                <InfoRow icon={<Clock size={16} />}         label="Heure réservation"  value={formatHeure(selected.heureReservation)} />
                <InfoRow icon={<CalendarCheck size={16} />} label="Date consultation"  value={formatDate(selected.jourConsultation)} />
                <InfoRow icon={<Clock size={16} />}         label="Heure consultation" value={formatHeure(selected.heureConsultation)} />
                <InfoRow icon={<Euro size={16} />}          label="Prix"               value={`${selected.prix} €`} />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {selected.statut === 'PAYEE' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleDownloadTicket(selected.id)}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <TicketCheck size={18} /> Télécharger le ticket
                  </motion.button>
                )}
                {(selected.statut === 'EN_ATTENTE' || selected.statut === 'EN_ATTENTE_PAIEMENT') && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleAnnulerReservation(selected)}
                    className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <XCircle size={18} /> Annuler la réservation
                  </motion.button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MesReservations;