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
  ShieldCheck,
  BadgeCheck,
  LifeBuoy,
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

  const legende = [
    { label: 'Disponible', icon: CheckCircle2, classes: 'bg-green-50 text-green-700 border-green-200' },
    { label: 'À payer', icon: CreditCard, classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Réservé', icon: Lock, classes: 'bg-slate-100 text-slate-500 border-slate-200' },
    { label: 'Indisponible', icon: XCircle, classes: 'bg-slate-50 text-slate-400 border-slate-200' },
  ];

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
          className="fixed inset-0 flex justify-center items-center z-50 bg-slate-900/40 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            key={`modal-${pro?.id ?? 'unknown'}`}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[88vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 sm:px-8 pt-6 pb-5 border-b border-slate-100">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                aria-label="Fermer"
                className="group absolute top-4 right-4 sm:top-5 sm:right-6 z-10 shrink-0 flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-2.5 pr-4 py-2 shadow-md hover:shadow-lg hover:border-red-200 hover:bg-red-50 transition-all duration-300"
              >
                <span className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-red-100 flex items-center justify-center transition-colors duration-300">
                  <X size={16} className="text-slate-500 group-hover:text-red-500 transition-colors duration-300" />
                </span>
                <span className="hidden sm:inline text-sm font-semibold text-slate-600 group-hover:text-red-600 transition-colors duration-300">
                  Fermer
                </span>
              </motion.button>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Stethoscope className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                      Créneaux disponibles
                    </h2>
                    <p className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm mt-0.5">
                      Dr. {pro?.nom || ''}
                      <BadgeCheck className="w-4 h-4 text-blue-500" />
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Sélectionnez le créneau qui vous convient le mieux
                    </p>
                  </div>
                </div>

                {/* Légende */}
                <div className="flex flex-wrap gap-2 pr-10 lg:pr-0">
                  {legende.map(({ label, icon: Icon, classes }) => (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${classes}`}
                    >
                      <Icon size={14} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Corps scrollable */}
            <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
              {disponibilites.length === 0 ? (
                <p className="text-center text-slate-400 text-base py-10">Aucune disponibilité trouvée.</p>
              ) : (
                disponibilites.map((dispo, idx) => {
                  const sousCreneaux = genererSousCreneaux(dispo);
                  const reservationsActives = dispo.reservations || [];

                  if (sousCreneaux.length === 0 && reservationsActives.length === 0) return null;

                  const dateObj = new Date(dispo.date);
                  const jourSemaine = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
                  const jourNombre = dateObj.toLocaleDateString('fr-FR', { day: 'numeric' });
                  const moisAnnee = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

                  return (
                    <section
                      key={`${dispo.date}-${idx}`}
                      className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 sm:p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="leading-tight">
                            <p className="text-blue-600 font-semibold text-sm capitalize">{jourSemaine}</p>
                            <p className="text-slate-900 font-extrabold text-2xl">{jourNombre}</p>
                            <p className="text-slate-400 text-xs capitalize">{moisAnnee}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                          <Clock size={16} />
                          <span>
                            {formatHeureAvecH(dispo.heureDebut)} - {formatHeureAvecH(dispo.heureFin)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
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
                              <button
                                key={`indispo-${dispo.id}-${heure}-${i}`}
                                disabled
                                className="flex flex-col items-center justify-center gap-1 min-w-[100px] rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed py-3 px-4"
                                title="Créneau indisponible"
                              >
                                <span className="text-sm font-semibold">{formatHeureAvecH(heure)}</span>
                                <span className="flex items-center gap-1 text-[11px] font-medium">
                                  <XCircle size={12} />
                                  Indisponible
                                </span>
                              </button>
                            );
                          }

                          if (resvAPayer) {
                            return (
                              <button
                                key={`payer-${resvAPayer.id}`}
                                onClick={() => onPayer(resvAPayer.id)}
                                className="flex flex-col items-center justify-center gap-1 min-w-[100px] rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 py-3 px-4 transition"
                                title="Réservation en attente de paiement"
                              >
                                <span className="text-sm font-semibold">{formatHeureAvecH(heure)}</span>
                                <span className="flex items-center gap-1 text-[11px] font-medium">
                                  <CreditCard size={12} />
                                  À payer
                                </span>
                              </button>
                            );
                          }

                          if (estReserve) {
                            return (
                              <button
                                key={`reserve-${dispo.id}-${heure}-${i}`}
                                disabled
                                className="flex flex-col items-center justify-center gap-1 min-w-[100px] rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed py-3 px-4 select-none"
                                title="Créneau déjà réservé"
                              >
                                <span className="text-sm font-semibold">{formatHeureAvecH(heure)}</span>
                                <span className="flex items-center gap-1 text-[11px] font-medium">
                                  <Lock size={12} />
                                  Réservé
                                </span>
                              </button>
                            );
                          }

                          return (
                            <button
                              key={`libre-${dispo.id}-${heure}-${i}`}
                              onClick={() => onReserver(dispo, heure)}
                              className="flex flex-col items-center justify-center gap-1 min-w-[100px] rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 transition"
                              title="Réserver ce créneau"
                            >
                              <span className="text-sm font-semibold">{formatHeureAvecH(heure)}</span>
                              <span className="flex items-center gap-1 text-[11px] font-medium">
                                <CheckCircle2 size={12} />
                                Disponible
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-slate-500 text-xs">
                <ShieldCheck size={16} className="text-blue-500" />
                Vos données sont sécurisées et vos paiements sont protégés.
              </p>
               
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
};

export default DisponibilitesModal;