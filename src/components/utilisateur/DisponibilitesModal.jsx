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
          <div className="animate-pulse p-8 rounded-2xl shadow-lg bg-slate-50 text-slate-400 text-lg font-semibold">
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
          className="fixed inset-0 flex justify-center items-center z-50 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key={`modal-${pro?.id ?? 'unknown'}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-blue-50 transition text-blue-600"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-8 justify-center text-blue-700 bg-blue-50 rounded-2xl py-3 px-6 mx-auto max-w-max">
              <Stethoscope size={30} />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 whitespace-nowrap">
                Créneaux du Dr {pro?.nom || ''}
              </h2>
            </div>

            {disponibilites.length === 0 ? (
              <p className="text-center text-slate-500 text-lg py-6">Aucune disponibilité trouvée.</p>
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
                  <section key={`${dispo.date}-${idx}`} className="mb-8">
                    <div className="flex justify-between items-center mb-4 px-1">
                      <div className="flex items-center gap-2 text-blue-700 font-semibold text-base sm:text-lg capitalize">
                        <CalendarCheck size={20} />
                        <span>{dateLocale}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 font-medium text-sm">
                        <Clock size={16} />
                        <span>
                          {formatHeureAvecH(dispo.heureDebut)} - {formatHeureAvecH(dispo.heureFin)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 px-1 pb-2">
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
                              className="flex flex-col items-center justify-center gap-1 min-w-[90px] rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-semibold py-3 px-4 shadow-sm transition active:scale-95"
                              title="Réservation en attente de paiement"
                            >
                              <CreditCard size={18} />
                              <span className="text-sm">{formatHeureAvecH(heure)}</span>
                            </button>
                          );
                        } else if (estReserve) {
                          return (
                            <button
                              key={`reserve-${dispo.id}-${heure}-${i}`}
                              disabled
                              className="flex flex-col items-center justify-center gap-1 min-w-[90px] rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed py-3 px-4 select-none"
                              title="Créneau déjà réservé"
                            >
                              <Lock size={18} />
                              <span className="text-sm">{formatHeureAvecH(heure)}</span>
                            </button>
                          );
                        } else {
                          return (
                            <button
                              key={`libre-${dispo.id}-${heure}-${i}`}
                              onClick={() => onReserver(dispo, heure)}
                              className="flex flex-col items-center justify-center gap-1 min-w-[90px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 shadow-sm shadow-blue-600/20 transition active:scale-95"
                              title="Réserver ce créneau"
                            >
                              <CheckCircle size={18} />
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