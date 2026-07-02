import React from 'react';
import {
  X,
  Lock,
  CreditCard,
  CheckCircle2,
  CalendarDays,
  MapPin,
  Clock,
  ShieldCheck,
  BadgeCheck,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '../ModalPortal';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const formatHeureAvecH = (heureStr) => {
  if (!heureStr) return '';
  const [h, m] = heureStr.split(':');
  return `${h}h${m}`;
};

const toMinutes = (hms) => {
  const [h, m] = hms.split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
};

const genererSousCreneauxDefaut = (dispo, dureeMinutes = 45) => {
  const sousCreneaux = [];
  if (!dispo.heureDebut || !dispo.heureFin) return sousCreneaux;
  const debut = toMinutes(dispo.heureDebut);
  const fin = toMinutes(dispo.heureFin);
  for (let t = debut; t + dureeMinutes <= fin; t += dureeMinutes) {
    sousCreneaux.push(fromMinutes(t));
  }
  return sousCreneaux;
};

const getInitiales = (nom) => {
  if (!nom) return 'PC';
  const parts = nom.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

/* ------------------------------------------------------------------ */
/*  Variants d'animation                                                */
/* ------------------------------------------------------------------ */
const dayVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.05 * i, ease: 'easeOut' },
  }),
};

const slotContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035 } },
};

const slotVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Bouton créneau                                                      */
/* ------------------------------------------------------------------ */
const SlotButton = ({ state, heure, onClick, disabled, title }) => {
  const base =
    'relative flex flex-col items-center justify-center gap-1 min-w-[92px] rounded-2xl py-3.5 px-4 font-semibold text-sm select-none transition-colors duration-200';

  const styles = {
    disponible:
      'bg-blue-600 text-white shadow-sm shadow-blue-600/25 hover:bg-blue-700',
    reserve: 'bg-slate-100 text-slate-400 cursor-not-allowed',
    paiement: 'bg-amber-400 text-white hover:bg-amber-500 shadow-sm shadow-amber-400/30',
  };

  return (
    <motion.button
      variants={slotVariants}
      whileHover={!disabled ? { scale: 1.06, y: -3, boxShadow: '0 12px 22px -8px rgba(37,99,235,0.35)' } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${styles[state]}`}
    >
      {state === 'reserve' && <Lock size={15} />}
      {state === 'paiement' && <CreditCard size={15} />}
      {state === 'disponible' && <CheckCircle2 size={15} className="opacity-90" />}
      <span>{formatHeureAvecH(heure)}</span>
    </motion.button>
  );
};

/* ------------------------------------------------------------------ */
/*  Carte journée                                                       */
/* ------------------------------------------------------------------ */
const DayCard = ({ dispo, index, genererSousCreneaux, onReserver, onPayer }) => {
  const sousCreneaux = genererSousCreneaux(dispo);
  const reservationsActives = dispo.reservations || [];

  if (sousCreneaux.length === 0 && reservationsActives.length === 0) return null;

  const dateLocale = new Date(dispo.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <motion.section
      custom={index}
      variants={dayVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_18px_-6px_rgba(15,23,42,0.06)] p-5 sm:p-6 mb-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5 text-slate-800 font-bold text-[15px] sm:text-base capitalize">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <CalendarDays size={17} />
          </span>
          {dateLocale}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
          <Clock size={14} />
          {formatHeureAvecH(dispo.heureDebut)} – {formatHeureAvecH(dispo.heureFin)}
        </div>
      </div>

      <motion.div
        variants={slotContainerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-3"
      >
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
              <SlotButton
                key={`payer-${resvAPayer.id}`}
                state="paiement"
                heure={heure}
                title="Réservation en attente de paiement"
                onClick={() => onPayer(resvAPayer.id)}
              />
            );
          }
          if (estReserve) {
            return (
              <SlotButton
                key={`reserve-${dispo.id}-${heure}-${i}`}
                state="reserve"
                heure={heure}
                disabled
                title="Créneau déjà réservé"
              />
            );
          }
          return (
            <SlotButton
              key={`libre-${dispo.id}-${heure}-${i}`}
              state="disponible"
              heure={heure}
              title="Réserver ce créneau"
              onClick={() => onReserver(dispo, heure)}
            />
          );
        })}
      </motion.div>
    </motion.section>
  );
};

/* ------------------------------------------------------------------ */
/*  Composant principal                                                 */
/* ------------------------------------------------------------------ */
const DisponibilitesModal = ({
  pro,
  disponibilites,
  onReserver,
  onPayer,
  onClose,
  loading,
  genererSousCreneaux,
}) => {
  const generer = genererSousCreneaux || genererSousCreneauxDefaut;
  const nomComplet = `${pro?.prenom || ''} ${pro?.nom || ''}`.trim() || 'Professionnel';
  const note = pro?.note ?? 4.8;

  if (loading) {
    return (
      <ModalPortal>
        <div className="fixed inset-0 flex justify-center items-center bg-white/90 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white shadow-xl">
            <div className="w-8 h-8 rounded-full border-[3px] border-blue-100 border-t-blue-600 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Chargement des disponibilités…</p>
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
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex justify-center items-center bg-slate-900/45 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            key={`modal-${pro?.id ?? 'unknown'}`}
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[88vh] bg-white rounded-[32px] shadow-[0_32px_80px_-16px_rgba(15,23,42,0.35)] overflow-hidden flex flex-col"
            style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
          >
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-700 backdrop-blur-sm transition"
              aria-label="Fermer"
            >
              <X size={19} />
            </button>

            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-50 via-blue-50/50 to-white px-6 sm:px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/25">
                    {getInitiales(nomComplet)}
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <BadgeCheck size={16} className="text-blue-600" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                      Dr {nomComplet}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 mb-1.5">{pro?.specialite || 'Spécialiste'}</p>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {note.toFixed?.(1) ?? note}
                    <span className="text-slate-300 font-normal ml-0.5">/ 5</span>
                  </div>
                </div>
              </div>

              {/* Infos rapides */}
              <div className="flex flex-wrap gap-2 mt-5">
                <span className="inline-flex items-center gap-1.5 bg-white text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200">
                  <MapPin size={13} className="text-blue-600" />
                  Consultation en ligne
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200">
                  <Clock size={13} className="text-blue-600" />
                  Durée : 45 min
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200">
                  <ShieldCheck size={13} className="text-blue-600" />
                  Paiement sécurisé
                </span>
              </div>
            </div>

            {/* Corps scrollable */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
              {disponibilites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <CalendarDays size={22} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">Aucune disponibilité trouvée.</p>
                  <p className="text-slate-400 text-sm mt-1">Revenez bientôt pour découvrir de nouveaux créneaux.</p>
                </div>
              ) : (
                disponibilites.map((dispo, idx) => (
                  <DayCard
                    key={`${dispo.date}-${idx}`}
                    dispo={dispo}
                    index={idx}
                    genererSousCreneaux={generer}
                    onReserver={onReserver}
                    onPayer={onPayer}
                  />
                ))
              )}
            </div>

            {/* Légende */}
            {disponibilites.length > 0 && (
              <div className="flex items-center justify-center gap-5 flex-wrap px-6 py-4 border-t border-slate-100 bg-slate-50/60">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="w-3 h-3 rounded-md bg-blue-600" />
                  Disponible
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="w-3 h-3 rounded-md bg-amber-400" />
                  Paiement
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="w-3 h-3 rounded-md bg-slate-200" />
                  Réservé
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
};

export default DisponibilitesModal;