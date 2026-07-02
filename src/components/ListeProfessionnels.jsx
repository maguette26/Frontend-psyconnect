import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import {
  UserCheck,
  CalendarDays,
  Filter,
  HeartPulse,
  Stethoscope,
  User,
  ArrowRightCircle,
  ArrowLeftCircle,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Brain,
  ShieldCheck,
  BadgeCheck,
  Zap,
  CreditCard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

import Header from './commun/header';
import PiedPage from './commun/PiedPage';
import PaymentForm from './utilisateur/PaymentForm';
import DisponibilitesModal from './utilisateur/DisponibilitesModal';
import ModalPortal from './ModalPortal';

const DUREE_CONSULTATION_MINUTES = 45;
const ITEMS_PER_PAGE = 6;

const getInitiales = (prenom, nom) => {
  const p = prenom?.charAt(0)?.toUpperCase() || '';
  const n = nom?.charAt(0)?.toUpperCase() || '';
  return `${p}${n}` || '?';
};

/* ------------------------------------------------------------------ */
/*  Illustration Hero — scène vectorielle : psychologue / patient / outils */
/* ------------------------------------------------------------------ */
const HeroIllustration = () => {
  return (
    <div className="relative w-full max-w-[560px] mx-auto select-none" aria-hidden="true">
      <svg viewBox="0 0 560 560" className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EFF6FF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#1E3A8A" floodOpacity="0.12" />
          </filter>
        </defs>

        <motion.path
          d="M280 40C400 30 520 110 530 250C540 390 430 500 290 520C150 540 30 450 25 300C20 150 160 50 280 40Z"
          fill="url(#blobGrad)"
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '280px 280px' }}
        />

        <ellipse cx="280" cy="470" rx="180" ry="14" fill="#BFDBFE" opacity="0.4" />
        <rect x="150" y="360" width="260" height="14" rx="7" fill="#1E3A8A" opacity="0.08" />

        <g filter="url(#softShadow)">
          <rect x="205" y="300" width="150" height="96" rx="10" fill="#0F172A" />
          <rect x="213" y="308" width="134" height="72" rx="4" fill="#EFF6FF" />
          <rect x="222" y="317" width="60" height="6" rx="3" fill="#93C5FD" />
          <rect x="222" y="329" width="90" height="6" rx="3" fill="#BFDBFE" />
          <circle cx="280" cy="352" r="16" fill="#2563EB" />
          <path d="M274 352l4 4 8-8" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M195 396h170l10 16H185z" fill="#1E293B" />
        </g>

        <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <ellipse cx="170" cy="330" rx="46" ry="58" fill="#2563EB" />
          <circle cx="170" cy="245" r="34" fill="#FDE9DC" />
          <path d="M136 240a34 34 0 0168 0v-6c0-20-15-32-34-32s-34 12-34 32z" fill="#1E293B" />
          <rect x="150" y="298" width="40" height="30" rx="10" fill="white" opacity="0.9" />
        </motion.g>

        <motion.g
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <ellipse cx="390" cy="335" rx="44" ry="55" fill="#60A5FA" />
          <circle cx="390" cy="253" r="32" fill="#FBD5C0" />
          <path d="M358 250a32 32 0 0164 0c0-22-14-36-32-36s-32 14-32 36z" fill="#334155" />
        </motion.g>

        <motion.g animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <rect x="245" y="150" width="72" height="46" rx="16" fill="white" filter="url(#softShadow)" />
          <circle cx="266" cy="173" r="4" fill="#2563EB" />
          <circle cx="281" cy="173" r="4" fill="#93C5FD" />
          <circle cx="296" cy="173" r="4" fill="#93C5FD" />
        </motion.g>

        <motion.g
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        >
          <rect x="60" y="140" width="90" height="82" rx="16" fill="white" filter="url(#softShadow)" />
          <rect x="60" y="140" width="90" height="24" rx="16" fill="url(#cardGrad)" />
          <rect x="76" y="176" width="14" height="14" rx="3" fill="#DBEAFE" />
          <rect x="98" y="176" width="14" height="14" rx="3" fill="#2563EB" />
          <rect x="120" y="176" width="14" height="14" rx="3" fill="#DBEAFE" />
          <rect x="76" y="196" width="14" height="14" rx="3" fill="#DBEAFE" />
          <rect x="98" y="196" width="14" height="14" rx="3" fill="#DBEAFE" />
        </motion.g>

        <motion.g
          animate={{ y: [0, -7, 0], rotate: [0, 1.5, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          style={{ transformOrigin: '450px 300px' }}
        >
          <rect x="415" y="255" width="70" height="94" rx="12" fill="white" filter="url(#softShadow)" />
          <rect x="423" y="266" width="54" height="70" rx="4" fill="#DBEAFE" />
          <circle cx="450" cy="253" r="1.6" fill="#94A3B8" />
          <path d="M438 300a12 12 0 0124 0" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="450" cy="292" r="3" fill="#2563EB" />
        </motion.g>

        <motion.g
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '440px 180px' }}
        >
          <circle cx="440" cy="180" r="22" fill="white" filter="url(#softShadow)" />
          <path d="M440 190s-11-7-11-15a7 7 0 0111-5.5A7 7 0 01451 175c0 8-11 15-11 15z" fill="#2563EB" />
        </motion.g>
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Carte profil (Psychologue / Psychiatre)                            */
/* ------------------------------------------------------------------ */
const ProfileCard = ({ icon, title, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    whileHover={{ y: -4 }}
    className="group relative bg-white rounded-[28px] p-7 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.18)] transition-shadow duration-500"
  >
    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{title}</h3>
    <p className="text-[15px] text-slate-500 leading-relaxed mb-6">{text}</p>
    <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:gap-2.5 transition-all">
      En savoir plus
      <ArrowUpRight size={16} />
    </button>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Carte "Pourquoi choisir PsyConnect"                                 */
/* ------------------------------------------------------------------ */
const FeatureCard = ({ icon, title, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    whileHover={{ y: -5 }}
    className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.05)] hover:border-blue-200 hover:shadow-[0_16px_32px_-12px_rgba(37,99,235,0.15)] transition-all duration-400"
  >
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center mb-4 shadow-sm shadow-blue-600/25 group-hover:scale-110 transition-transform duration-400">
      {icon}
    </div>
    <h4 className="text-[15px] font-bold text-slate-900 mb-1.5">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
  </motion.div>
);

const ListeProfessionnels = () => {
  const [step, setStep] = useState(1);
  const [professionnels, setProfessionnels] = useState([]);
  const [selectedPro, setSelectedPro] = useState(null);
  const [disponibilites, setDisponibilites] = useState([]);
  const [disponibilitesVisibles, setDisponibilitesVisibles] = useState(false);
  const [error, setError] = useState('');
  const [reservationIdPourPaiement, setReservationIdPourPaiement] = useState(null);

  const [specialites, setSpecialites] = useState([]);
  const [selectedSpecialite, setSelectedSpecialite] = useState('all');

  // --- Nouveaux states UI (recherche / tri / pagination) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nom'); // 'nom' | 'specialite'
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const fetchProfessionnels = async () => {
      try {
        const res = await api.get('/professionnels/tous');
        setProfessionnels(res.data);
        setError('');
        const specs = Array.from(new Set(res.data.map(p => p.specialite))).sort();
        setSpecialites(specs);
      } catch (err) {
        console.error(err);
        setError("❌ Impossible de charger les professionnels.");
      }
    };
    fetchProfessionnels();
  }, []);

  useEffect(() => {
    if (step === 2) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  // Réinitialise la page courante quand un filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSpecialite, searchTerm, sortBy]);

  const fetchDisponibilites = async (proId) => {
    try {
      setSelectedPro(null);
      setDisponibilites([]);
      setDisponibilitesVisibles(false);

      const res = await api.get(`/disponibilites/${proId}`);
      const pro = professionnels.find(p => p.id === proId) || null;
      setSelectedPro(pro);

      const maintenant = new Date();

      const disponibilitesFiltreesEtTriees = res.data
        .filter(dispo => {
          const [hEnd, mEnd] = dispo.heureFin.split(':').map(Number);
          const finDispo = new Date(dispo.date);
          finDispo.setHours(hEnd, mEnd, 0, 0);
          return finDispo > maintenant;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setDisponibilites(disponibilitesFiltreesEtTriees);
      setDisponibilitesVisibles(true);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des disponibilités.");
    }
  };

  const genererSousCreneaux = (dispo) => {
    const sousCreneaux = [];
    const [hStart, mStart] = dispo.heureDebut.split(':').map(Number);
    const [hEnd, mEnd] = dispo.heureFin.split(':').map(Number);
    const dateDispo = new Date(dispo.date);
    const debut = new Date(dateDispo);
    debut.setHours(hStart, mStart, 0, 0);
    const fin = new Date(dateDispo);
    fin.setHours(hEnd, mEnd, 0, 0);
    const maintenant = new Date();
    const duree = DUREE_CONSULTATION_MINUTES * 60 * 1000;
    const heuresReservees = dispo.reservations?.map(r => r.heureConsultation?.substring(0, 5)) || [];

    while (debut.getTime() + duree <= fin.getTime()) {
      const heureStr = debut.toTimeString().slice(0, 5);
      const creneauDateTime = new Date(debut);
      if (!heuresReservees.includes(heureStr) && creneauDateTime > maintenant) {
        sousCreneaux.push(heureStr);
      }
      debut.setTime(debut.getTime() + duree);
    }

    return sousCreneaux;
  };

  const reserverCreneau = async (dispo, heureConsultation) => {
    if (!dispo?.id) {
      toast.error("ID de la disponibilité introuvable.");
      return;
    }

    const heureFormatee = `${heureConsultation}:00`;
    const reservation = {
      disponibilite: { id: dispo.id },
      heureReservation: heureFormatee,
      heureConsultation: heureFormatee,
    };

    try {
      await api.post('/reservations', reservation);
      toast.success('✅ Réservation enregistrée ! Attente de validation du professionnel.');
      if (selectedPro) fetchDisponibilites(selectedPro.id);
    } catch (error) {
      if (error.response) {
        console.error('Erreur serveur:', error.response.data);
        toast.error(`Erreur : ${error.response.data.message || 'Réservation échouée'}`);
      } else {
        console.error('Erreur axios:', error.message);
        toast.error('Erreur réseau');
      }
    }
  };

  // Filtre par spécialité (logique existante, inchangée)
  const professionnelsFiltres = selectedSpecialite === 'all'
    ? professionnels
    : professionnels.filter(pro => pro.specialite === selectedSpecialite);

  // Recherche + tri (ajout UI) appliqués sur le résultat filtré ci-dessus
  const professionnelsAffiches = useMemo(() => {
    let liste = professionnelsFiltres;

    if (searchTerm.trim() !== '') {
      const q = searchTerm.trim().toLowerCase();
      liste = liste.filter((pro) =>
        `${pro.prenom || ''} ${pro.nom || ''}`.toLowerCase().includes(q) ||
        (pro.specialite || '').toLowerCase().includes(q)
      );
    }

    liste = [...liste].sort((a, b) => {
      if (sortBy === 'specialite') {
        return (a.specialite || '').localeCompare(b.specialite || '');
      }
      return (a.nom || '').localeCompare(b.nom || '');
    });

    return liste;
  }, [professionnelsFiltres, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(professionnelsAffiches.length / ITEMS_PER_PAGE));
  const professionnelsPage = professionnelsAffiches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  const iconSpecialite = (specialite) => {
    if (!specialite) return <UserCheck className="w-6 h-6 text-blue-600" />;
    const s = specialite.toLowerCase();
    if (s.includes('psychiatre')) return <Stethoscope className="w-6 h-6 text-blue-600" />;
    if (s.includes('psychologue')) return <User className="w-6 h-6 text-blue-600" />;
    return <UserCheck className="w-6 h-6 text-blue-600" />;
  };

  return (
    <>
      <Header />
      <ToastContainer position="top-right" />
      <main
        className="max-w-7xl mx-auto px-6 min-h-[70vh]"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.section
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.5 } }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="relative w-full overflow-hidden bg-white rounded-3xl mt-6"
            >
              {/* Halos dégradés décoratifs */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 right-[-10%] w-[640px] h-[640px] rounded-full bg-gradient-to-br from-blue-100 via-blue-50 to-transparent blur-3xl opacity-70"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[30%] -left-40 w-[420px] h-[420px] rounded-full bg-blue-50 blur-3xl opacity-60"
              />

              <div className="relative px-6 lg:px-10 pt-14 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  {/* Colonne texte */}
                  <div>
                    <motion.span
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[13px] font-semibold px-4 py-2 rounded-full mb-7 border border-blue-100"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Votre santé mentale mérite le meilleur accompagnement
                    </motion.span>

                    <motion.h1
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                      className="text-[2.5rem] sm:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-6"
                    >
                      Prenez rendez-vous avec un professionnel de santé mentale en toute confiance
                      <span className="text-blue-600">.</span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.2 }}
                      className="text-[17px] text-slate-500 leading-relaxed max-w-lg mb-9"
                    >
                      Discutez avec des psychologues et psychiatres qualifiés, réservez une
                      consultation en quelques clics et bénéficiez d'un accompagnement sécurisé.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.3 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep(2)}
                        className="group inline-flex items-center gap-2.5 bg-blue-600 text-white font-semibold rounded-2xl px-7 py-4 shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-600/35 transition-all duration-300"
                        aria-label="Découvrir nos professionnels"
                      >
                        Découvrir nos professionnels
                        <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Colonne illustration */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                  >
                    <HeroIllustration />
                  </motion.div>
                </div>

                {/* Deux grandes cartes premium */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 lg:mt-2">
                  <ProfileCard
                    icon={<Brain size={24} />}
                    title="Psychologue"
                    text="Les psychologues accompagnent les personnes grâce à la thérapie, l'écoute active et des méthodes adaptées pour améliorer le bien-être psychologique."
                    delay={0.1}
                  />
                  <ProfileCard
                    icon={<Stethoscope size={24} />}
                    title="Psychiatre"
                    text="Les psychiatres sont des médecins spécialisés pouvant établir un diagnostic médical, prescrire des traitements et assurer un suivi clinique."
                    delay={0.2}
                  />
                </div>
              </div>

              {/* Pourquoi choisir PsyConnect */}
              <div className="relative px-6 lg:px-10 py-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                    Pourquoi choisir <span className="text-blue-600">PsyConnect</span> ?
                  </h2>
                  <p className="text-slate-500 text-[15px] max-w-md mx-auto">
                    Une expérience pensée pour votre tranquillité d'esprit, du premier clic au suivi.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <FeatureCard
                    icon={<ShieldCheck size={20} />}
                    title="Consultation sécurisée"
                    text="Vos échanges sont chiffrés et confidentiels, à chaque étape."
                    delay={0}
                  />
                  <FeatureCard
                    icon={<BadgeCheck size={20} />}
                    title="Professionnels certifiés"
                    text="Psychologues et psychiatres vérifiés et diplômés."
                    delay={0.08}
                  />
                  <FeatureCard
                    icon={<Zap size={20} />}
                    title="Réservation rapide"
                    text="Trouvez un créneau adapté en quelques clics, sans attendre."
                    delay={0.16}
                  />
                  <FeatureCard
                    icon={<CreditCard size={20} />}
                    title="Paiement sécurisé"
                    text="Transactions protégées, sans jamais transiter par nos serveurs."
                    delay={0.24}
                  />
                </div>
              </div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section
              key="liste"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="px-2 py-8"
            >
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">
                  Nos professionnels certifiés
                </h2>
                <p className="text-slate-500 text-sm">Des experts qualifiés pour vous accompagner</p>
              </div>

              {/* Toolbar : recherche + filtre spécialité + tri */}
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between bg-white border border-slate-100 rounded-2xl shadow-sm p-4 mb-8">
                <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200 flex-1 max-w-md">
                  <Search className="text-slate-400 w-4.5 h-4.5 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un nom ou une spécialité..."
                    className="bg-transparent border-none focus:ring-0 text-sm text-slate-700 placeholder:text-slate-400 w-full outline-none"
                    aria-label="Rechercher un professionnel"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 border border-slate-200 shadow-sm">
                    <Filter className="text-blue-600 w-4.5 h-4.5" />
                    <select
                      value={selectedSpecialite}
                      onChange={(e) => setSelectedSpecialite(e.target.value)}
                      className="appearance-none bg-transparent border-none focus:ring-0 text-slate-700 font-medium text-sm cursor-pointer"
                      aria-label="Filtrer par spécialité"
                    >
                      <option value="all">Toutes les spécialités</option>
                      {specialites.map((spec, idx) => (
                        <option key={idx} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 border border-slate-200 shadow-sm">
                    <ArrowUpDown className="text-blue-600 w-4.5 h-4.5" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-transparent border-none focus:ring-0 text-slate-700 font-medium text-sm cursor-pointer"
                      aria-label="Trier les professionnels"
                    >
                      <option value="nom">Trier par nom</option>
                      <option value="specialite">Trier par spécialité</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-600 text-center mb-4">{error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {professionnelsAffiches.length === 0 ? (
                  <p className="col-span-full text-center text-slate-500 italic py-8">
                    Aucun professionnel ne correspond à votre recherche.
                  </p>
                ) : (
                  professionnelsPage.map((pro) => (
                    <motion.div
                      key={pro.id}
                      whileHover={{ y: -6 }}
                      className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {getInitiales(pro.prenom, pro.nom)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            Dr. {pro.prenom} {pro.nom}
                          </h3>
                          <p className="text-sm text-slate-500">{pro.specialite}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-5">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          {iconSpecialite(pro.specialite)}
                          {pro.specialite}
                        </span>
                        <span className="inline-flex items-center bg-slate-50 text-slate-400 text-xs font-medium px-2.5 py-1 rounded-full">
                          Nouveau professionnel
                        </span>
                      </div>

                      <button
                        onClick={() => fetchDisponibilites(pro.id)}
                        className="mt-auto px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2.5 font-semibold transition-colors shadow-sm shadow-blue-600/20 active:scale-95"
                      >
                        <CalendarDays className="w-4.5 h-4.5" />
                        Voir les disponibilités
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Pagination moderne */}
              {professionnelsAffiches.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-10">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                          : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl px-8 py-3 transition-all active:scale-95"
                  aria-label="Retour à l'introduction"
                >
                  <ArrowLeftCircle className="w-5 h-5" />
                  Retour à l&apos;introduction
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {disponibilitesVisibles && selectedPro && (
          <DisponibilitesModal
            key={`modal-pro-${selectedPro.id}`}
            pro={selectedPro}
            disponibilites={disponibilites}
            genererSousCreneaux={genererSousCreneaux}
            onReserver={reserverCreneau}
            onPayer={setReservationIdPourPaiement}
            onClose={() => setDisponibilitesVisibles(false)}
          />
        )}

        {reservationIdPourPaiement && (
          <ModalPortal>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
              onClick={() => setReservationIdPourPaiement(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="p-6 bg-white rounded-2xl shadow-xl max-w-md w-full max-h-screen overflow-auto"
              >
                <PaymentForm
                  reservationId={reservationIdPourPaiement}
                  onClose={() => setReservationIdPourPaiement(null)}
                />
              </div>
            </div>
          </ModalPortal>
        )}
      </main>
      <PiedPage />
    </>
  );
};

export default ListeProfessionnels;