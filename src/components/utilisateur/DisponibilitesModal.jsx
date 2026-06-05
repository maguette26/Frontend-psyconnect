import React from 'react';
import { CalendarCheck, Clock, User2, Stethoscope, X, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '../ModalPortal';

const DisponibilitesModal = ({ pro, disponibilites, onReserver, onPayer, onClose, loading }) => {
  const formatHeureAvecH = (heureStr) => {
    if (!heureStr) return '';
    const [h, m] = heureStr.split(':');
    return `${h}h${m}`;
  };

  const genererSousCreneaux = (dispo, dureeMinutes = 45) => {
    const sousCreneaux = [];
    if (!dispo.heureDebut || !dispo.heureFin) return sousCreneaux;

    const toMinutes = (hms) => {
      const [h, m] = hms.split(':').map(Number);
      return h * 60 + m;
    };

    const fromMinutes = (minutes) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
    };

    const debut = toMinutes(dispo.heureDebut);
    const fin = toMinutes(dispo.heureFin);

    for (let t = debut; t + dureeMinutes <= fin; t += dureeMinutes) {
      sousCreneaux.push(fromMinutes(t));
    }

    return sousCreneaux;
  };

  if (loading) {
    return (
      <ModalPortal>
        <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-90 z-50">
          <div className="animate-pulse p-8 rounded-lg shadow-lg bg-gray-100 text-gray-400 text-lg font-semibold">
            Chargement des disponibilités...
          </div>
        </div>
      </ModalPortal>
    );
  }

  return (
    <ModalPortal>
      <AnimatePresence>
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex justify-center items-center z-50 bg-white/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key={`modal-${pro?.id ?? 'unknown'}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1 rounded hover:bg-indigo-100 transition"
              aria-label="Fermer"
              style={{ color: '#4F46E5' }}
            >
              <X size={28} />
            </button>

            <div className="flex items-center gap-3 mb-8 justify-center text-indigo-700 bg-white/70 backdrop-blur-sm rounded-md py-2 px-6 mx-auto max-w-max shadow-sm">
              
              <Stethoscope size={34} />
              <h2 className="text-3xl font-semibold text-gray-900 whitespace-nowrap">
                Créneaux du Dr  {pro?.nom || ''}
              </h2>
            </div>

            {disponibilites.length === 0 ? (
              <p className="text-center text-gray-500 text-lg">Aucune disponibilité trouvée.</p>
            ) : (
              disponibilites.map((dispo, idx) => {
                const sousCreneaux = genererSousCreneaux(dispo);
                const reservationsActives = dispo.reservations || [];

                if (sousCreneaux.length === 0 && reservationsActives.length === 0) return null;

                const dateLocale = new Date(dispo.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                });

                return (
                  <section key={`${dispo.date}-${idx}`} className="mb-10">
                    <div className="flex justify-between items-center mb-4 px-3">
                      <div className="flex items-center gap-2 text-indigo-700 font-semibold text-lg capitalize">
                        <CalendarCheck size={22} />
                        <span>{dateLocale}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 font-medium">
                        <Clock size={18} />
                        <span>
                          {formatHeureAvecH(dispo.heureDebut)} - {formatHeureAvecH(dispo.heureFin)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3 overflow-x-auto px-3 pb-2">
                      {sousCreneaux.map((heure, i) => {
                        const resvAPayer = reservationsActives.find(
                          (resv) =>
                            resv.statut === 'EN_ATTENTE_PAIEMENT' &&
                            resv.statutValidation === 'VALIDE' &&
                            resv.heureConsultation === heure
                        );
                        const estReserve = reservationsActives.some(
                          (resv) =>
                            (resv.statut === 'PAYEE' || resv.statut === 'EN_ATTENTE') &&
                            resv.heureConsultation === heure
                        );

                        if (resvAPayer) {
                          return (
                            <button
                              key={`payer-${resvAPayer.id}`}
                              onClick={() => onPayer(resvAPayer.id)}
                              className="flex flex-col items-center justify-center gap-1 min-w-[90px] rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 shadow-md transition"
                              title="Réservation en attente de paiement"
                            >
                              <CreditCard size={20} />
                              <span className="text-sm">{formatHeureAvecH(heure)}</span>
                            </button>
                          );
                        } else if (estReserve) {
                          return (
                            <button
                              key={`reserve-${dispo.id}-${heure}-${i}`}
                              disabled
                              className="flex flex-col items-center justify-center gap-1 min-w-[90px] rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed py-3 px-4 select-none shadow-inner"
                              title="Créneau déjà réservé"
                            >
                              <Lock size={20} />
                              <span className="text-sm">{formatHeureAvecH(heure)}</span>
                            </button>
                          );
                        } else {
                          return (
                            <button
                              key={`libre-${dispo.id}-${heure}-${i}`}
                              onClick={() => onReserver(dispo, heure)}
                              className="flex flex-col items-center justify-center gap-1 min-w-[90px] rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 shadow-md transition"
                              title="Réserver ce créneau"
                            >
                              <CheckCircle size={20} />
                              <span className="text-sm">{formatHeureAvecH(heure)}</span>
                            </button>
                          );
                        }
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
};

export default DisponibilitesModal;
