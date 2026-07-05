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
        <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-90 z-50 px-4">
          <div className="animate-pulse p-6 sm:p-8 rounded-lg shadow-lg bg-gray-100 text-gray-400 text-base sm:text-lg font-semibold text-center">
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
          className="fixed inset-0 flex justify-center items-center sm:items-center z-50 bg-slate-900/40 backdrop-blur-sm px-0 sm:px-4"
          onClick={onClose}
        >
          <motion.div
            key={`modal-${pro?.id ?? 'unknown'}`}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-4xl flex flex-col overflow-hidden"
            style={{
              maxHeight: '90vh',
              // sur mobile, colle en bas avec les marges de sécurité prises en compte
              marginBottom: 'env(safe-area-inset-bottom)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — reste toujours visible (non scrollable) */}
            <div className="relative px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-slate-100 shrink-0">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                aria-label="Fermer"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 rounded-full bg-slate-700 hover:bg-red-600 shadow-md flex items-center justify-center transition-colors duration-200 shrink-0"
              >
                <span className="text-white text-lg leading-none font-bold select-none">×</span>
              </motion.button>

              <div className="flex flex-col gap-3 sm:gap-4 pr-10">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Stethoscope className="w-5.5 h-5.5 sm:w-7 sm:h-7 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 leading-tight truncate">
                      Créneaux disponibles
                    </h2>
                    <p className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs sm:text-sm mt-0.5 truncate">
                      Dr. {pro?.nom || ''}
                      <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    </p>
                    <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5 hidden sm:block">
                      Sélectionnez le créneau qui vous convient le mieux
                    </p>
                  </div>
                </div>

                {/* Légende compacte — scroll horizontal si nécessaire sur très petit écran, jamais coupée */}
                <div className="flex flex-nowrap sm:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
                  {legende.map(({ label, icon: Icon, classes }) => (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border shrink-0 whitespace-nowrap ${classes}`}
                    >
                      <Icon size={12} className="shrink-0 sm:hidden" />
                      <Icon size={14} className="shrink-0 hidden sm:block" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Corps scrollable — seule zone qui défile */}
            <div className="overflow-y-auto flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
              {disponibilites.length === 0 ? (
                <p className="text-center text-slate-400 text-sm sm:text-base py-10">Aucune disponibilité trouvée.</p>
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
                      className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 sm:p-4 lg:p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <CalendarDays className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div className="leading-tight min-w-0">
                            <p className="text-blue-600 font-semibold text-xs sm:text-sm capitalize truncate">{jourSemaine}</p>
                            <p className="text-slate-900 font-extrabold text-xl sm:text-2xl">{jourNombre}</p>
                            <p className="text-slate-400 text-[11px] sm:text-xs capitalize truncate">{moisAnnee}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm font-medium shrink-0">
                          <Clock size={15} className="shrink-0" />
                          <span className="whitespace-nowrap">
                            {formatHeureAvecH(dispo.heureDebut)} - {formatHeureAvecH(dispo.heureFin)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:gap-3">
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

                          const baseBtnCls = "flex flex-col items-center justify-center gap-1 min-w-[86px] sm:min-w-[100px] rounded-xl border py-2.5 sm:py-3 px-3 sm:px-4 transition";

                          if (estPasse && !resvAPayer && !estReserve) {
                            return (
                              <button
                                key={`indispo-${dispo.id}-${heure}-${i}`}
                                disabled
                                className={`${baseBtnCls} border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed`}
                                title="Créneau indisponible"
                              >
                                <span className="text-xs sm:text-sm font-semibold">{formatHeureAvecH(heure)}</span>
                                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium whitespace-nowrap">
                                  <XCircle size={11} className="shrink-0" />
                                  Indispo.
                                </span>
                              </button>
                            );
                          }

                          if (resvAPayer) {
                            return (
                              <button
                                key={`payer-${resvAPayer.id}`}
                                onClick={() => onPayer(resvAPayer.id)}
                                className={`${baseBtnCls} border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700`}
                                title="Réservation en attente de paiement"
                              >
                                <span className="text-xs sm:text-sm font-semibold">{formatHeureAvecH(heure)}</span>
                                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium whitespace-nowrap">
                                  <CreditCard size={11} className="shrink-0" />
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
                                className={`${baseBtnCls} border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed select-none`}
                                title="Créneau déjà réservé"
                              >
                                <span className="text-xs sm:text-sm font-semibold">{formatHeureAvecH(heure)}</span>
                                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium whitespace-nowrap">
                                  <Lock size={11} className="shrink-0" />
                                  Réservé
                                </span>
                              </button>
                            );
                          }

                          return (
                            <button
                              key={`libre-${dispo.id}-${heure}-${i}`}
                              onClick={() => onReserver(dispo, heure)}
                              className={`${baseBtnCls} border-green-200 bg-green-50 hover:bg-green-100 text-green-700`}
                              title="Réserver ce créneau"
                            >
                              <span className="text-xs sm:text-sm font-semibold">{formatHeureAvecH(heure)}</span>
                              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium whitespace-nowrap">
                                <CheckCircle2 size={11} className="shrink-0" />
                                Dispo.
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

            {/* Footer — reste toujours visible (non scrollable) */}
            <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 shrink-0">
              <p className="flex items-center gap-2 text-slate-500 text-[11px] sm:text-xs text-center sm:text-left">
                <ShieldCheck size={16} className="text-blue-500 shrink-0" />
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