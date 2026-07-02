import React from 'react';
import {
  CalendarDays,
  Clock,
  Stethoscope,
  X,
  CreditCard,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
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

  // Détermine si un créneau (date + heure) est déjà passé
  const estCreneauPasse = (dateStr, heureStr) => {
    if (!dateStr || !heureStr) return false;
    const [h, m] = heureStr.split(':').map(Number);
    const dt = new Date(dateStr);
    dt.setHours(h, m, 0, 0);
    return dt.getTime() < Date.now();
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 8 },
    visible: (i = 0) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.35, delay: i * 0.04, ease: 'easeOut' },
    }),
  };

  if (loading) {
    return (
      <ModalPortal>
        <div className="fixed inset-0 flex justify-center items-center bg-white/90 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-3 px-10 py-8 rounded-3xl shadow-xl bg-white border border-slate-100">
            <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
            <p className="text-slate-500 text-sm font-semibold tracking-wide">
              Chargement des disponibilités...
            </p>
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
          className="fixed inset-0 flex justify-center items-center z-50 bg-slate-900/30 backdrop-blur-md px-3 sm:px-6"
          onClick={onClose}
        >
          <motion.div
            key={`modal-${pro?.id ?? 'unknown'}`}
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[30px] border border-white/60 bg-gradient-to-br from-white via-blue-50/40 to-white shadow-[0_30px_80px_-20px_rgba(37,99,235,0.25)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ------------------------- En-tête ------------------------- */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 sm:px-9 py-6 bg-white/70 backdrop-blur-xl border-b border-slate-100/80">
              <div className="flex items-center gap-4 min-w-0">
                <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                    Disponibilités du Dr {pro?.nom || ''}
                  </h2>
                  {pro?.specialite && (
                    <p className="text-sm font-semibold text-blue-600 tracking-wide">
                      {pro.specialite}
                    </p>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                aria-label="Fermer"
                className="group shrink-0 flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-2.5 pr-4 py-2 shadow-md hover:shadow-lg hover:border-red-200 hover:bg-red-50 transition-all duration-300"
              >
                <span className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-red-100 flex items-center justify-center transition-colors duration-300">
                  <X size={16} className="text-slate-500 group-hover:text-red-500 transition-colors duration-300" />
                </span>
                <span className="hidden sm:inline text-sm font-semibold text-slate-600 group-hover:text-red-600 transition-colors duration-300">
                  Fermer
                </span>
              </motion.button>
            </div>

            {/* ------------------------- Corps ------------------------- */}
            <div className="overflow-y-auto px-6 sm:px-9 py-8 space-y-7">
              {disponibilites.length === 0 ? (
                <p className="text-center text-slate-400 text-base font-medium py-16">
                  Aucune disponibilité trouvée.
                </p>
              ) : (
                disponibilites.map((dispo, idx) => {
                  const sousCreneaux = genererSousCreneaux(dispo);
                  const reservationsActives = dispo.reservations || [];

                  if (sousCreneaux.length === 0 && reservationsActives.length === 0) return null;

                  const dateObj = new Date(dispo.date);
                  const dateLocale = dateObj.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  });

                  return (
                    <motion.section
                      key={`${dispo.date}-${idx}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.06, ease: 'easeOut' }}
                      className="rounded-3xl bg-white/80 border border-blue-50 shadow-sm p-5 sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                        <div className="flex items-center gap-2.5">
                          <CalendarDays className="w-5 h-5 text-blue-600" />
                          <h3 className="font-bold text-slate-900 text-base sm:text-lg capitalize tracking-tight">
                            {dateLocale}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-semibold tracking-wide">
                          <Clock size={15} />
                          <span>{formatHeureAvecH(dispo.heureDebut)}</span>
                          <ArrowRight size={13} />
                          <span>{formatHeureAvecH(dispo.heureFin)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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
                          const estPasse = estCreneauPasse(dispo.date, heure);

                          if (estPasse && !resvAPayer && !estReserve) {
                            return (
                              <motion.div
                                key={`indispo-${dispo.id}-${heure}-${i}`}
                                custom={i}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-300 py-4 px-3 cursor-not-allowed select-none"
                                title="Créneau indisponible"
                              >
                                <XCircle size={18} />
                                <span className="text-sm font-bold tracking-tight">{formatHeureAvecH(heure)}</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wide">Indisponible</span>
                              </motion.div>
                            );
                          }

                          if (resvAPayer) {
                            return (
                              <motion.button
                                key={`payer-${resvAPayer.id}`}
                                custom={i}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onPayer(resvAPayer.id)}
                                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 py-4 px-3 transition-shadow duration-300 hover:shadow-xl"
                                title="Réservation en attente de paiement"
                              >
                                <CreditCard size={18} />
                                <span className="text-sm font-bold tracking-tight">{formatHeureAvecH(heure)}</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-50">
                                  Payer
                                </span>
                              </motion.button>
                            );
                          }

                          if (estReserve) {
                            return (
                              <motion.div
                                key={`reserve-${dispo.id}-${heure}-${i}`}
                                custom={i}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-slate-100 text-slate-400 py-4 px-3 cursor-not-allowed select-none"
                                title="Créneau déjà réservé"
                              >
                                <Lock size={18} />
                                <span className="text-sm font-bold tracking-tight">{formatHeureAvecH(heure)}</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wide">Réservé</span>
                              </motion.div>
                            );
                          }

                          return (
                            <motion.button
                              key={`libre-${dispo.id}-${heure}-${i}`}
                              custom={i}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => onReserver(dispo, heure)}
                              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 py-4 px-3 transition-shadow duration-300 hover:shadow-xl"
                              title="Réserver ce créneau"
                            >
                              <CheckCircle2 size={18} />
                              <span className="text-sm font-bold tracking-tight">{formatHeureAvecH(heure)}</span>
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-50">
                                Disponible
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.section>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
};

export default DisponibilitesModal;