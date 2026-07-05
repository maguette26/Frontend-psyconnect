import React, { useEffect, useState, useMemo, useRef } from 'react';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import {
  UserCheck,
  CalendarDays,
  Filter,
  Stethoscope,
  User,
  ArrowRightCircle,
  ArrowLeftCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  BadgeCheck,
  MessagesSquare,
  CalendarCheck2,
  Leaf,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

import Header from './commun/header';
import PiedPage from './commun/PiedPage';
import PaymentForm from './utilisateur/PaymentForm';
import DisponibilitesModal from './utilisateur/DisponibilitesModal';
import ModalPortal from './ModalPortal';

import heroTherapieImg from '../assets/hero-therapie.png';

const DUREE_CONSULTATION_MINUTES = 45;
const ITEMS_PER_PAGE = 6;

const getInitiales = (prenom, nom) => {
  const p = prenom?.charAt(0)?.toUpperCase() || '';
  const n = nom?.charAt(0)?.toUpperCase() || '';
  return `${p}${n}` || '?';
};

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

  // --- States UI (recherche / tri / pagination) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nom'); // 'nom' | 'specialite'
  const [currentPage, setCurrentPage] = useState(1);

  const comparatifRef = useRef(null);

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

  // Recherche + tri appliqués sur le résultat filtré ci-dessus
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
    if (!specialite) return <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />;
    const s = specialite.toLowerCase();
    if (s.includes('psychiatre')) return <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />;
    if (s.includes('psychologue')) return <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />;
    return <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />;
  };

  // Va à la liste (step 2), en pré-filtrant éventuellement sur une spécialité
  const allerVersListe = (motCle) => {
    if (motCle) {
      const match = specialites.find((s) => s.toLowerCase().includes(motCle));
      setSelectedSpecialite(match || 'all');
    }
    setStep(2);
  };

  const scrollVersComparatif = () => {
    comparatifRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const etapes = [
    { icon: UserCheck, title: 'Choisissez un professionnel', desc: 'Parcourez les profils vérifiés et trouvez celui qui vous correspond.' },
    { icon: CalendarDays, title: 'Consultez les disponibilités', desc: "Visualisez les créneaux libres en temps réel." },
    { icon: CalendarCheck2, title: 'Réservez un créneau', desc: "Confirmez votre rendez-vous en quelques clics." },
    { icon: MessagesSquare, title: 'Échangez avec votre professionnel', desc: 'Votre consultation se déroule en toute confidentialité.' },
  ];

  return (
    <>
      <Header />
      <ToastContainer position="top-right" />
      <main
        className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[70vh] overflow-x-hidden"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.section
              key="intro"
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
                exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: 'easeIn' } }
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              className="py-8 sm:py-12 space-y-12 sm:space-y-16 lg:space-y-20"
            >
              {/* ---------------------------- HERO ---------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
                    <Leaf size={15} className="shrink-0" />
                    Prenez soin de votre santé mentale
                  </span>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.2] mb-4 sm:mb-5">
                    Vous n'êtes pas seul.
                    <br />
                    <span className="text-blue-600">Des professionnels sont là pour vous accompagner.</span>
                  </h1>

                  <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-lg mb-6 sm:mb-8">
                    Que vous traversiez une période difficile, que vous ressentiez du stress, de
                    l'anxiété, ou que vous souhaitiez simplement échanger avec un professionnel,
                    PsyConnect vous permet de prendre rendez-vous facilement avec un psychologue ou
                    un psychiatre qualifié.
                  </p>

                  <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => allerVersListe()}
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold rounded-2xl px-6 sm:px-7 py-3 sm:py-3.5 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all text-sm sm:text-base"
                    >
                      Trouver un professionnel
                      <ArrowRightCircle className="w-5 h-5 shrink-0" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={scrollVersComparatif}
                      className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold rounded-2xl px-6 sm:px-7 py-3 sm:py-3.5 border border-slate-200 hover:bg-slate-50 transition-all text-sm sm:text-base"
                    >
                      Comment choisir ?
                    </motion.button>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="w-full max-w-md mx-auto lg:max-w-none"
                >
                  <img
                    src={heroTherapieImg}
                    alt="Consultation entre une patiente et une psychologue dans un cabinet chaleureux"
                    className="w-full h-auto rounded-3xl shadow-lg object-cover"
                  />
                </motion.div>
              </div>

              {/* ------------------- COMPARATIF PSYCHOLOGUE / PSYCHIATRE ------------------- */}
              <div ref={comparatifRef} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 flex flex-col"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 sm:mb-5 shrink-0">
                    <User className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg sm:text-xl mb-3">Psychologue</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5 sm:mb-6 flex-1">
                    Le psychologue accompagne les personnes grâce à l'écoute, au dialogue et à
                    différentes approches thérapeutiques. Il aide à mieux comprendre ses émotions,
                    gérer le stress, l'anxiété, les difficultés personnelles ou relationnelles. Il
                    ne prescrit pas de médicaments.
                  </p>
                  <button
                    onClick={() => allerVersListe('psychologue')}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold rounded-xl px-5 py-3 hover:bg-blue-700 transition-colors w-full sm:w-fit text-sm sm:text-base"
                  >
                    Choisir un psychologue
                    <ArrowRightCircle className="w-4.5 h-4.5 shrink-0" />
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 flex flex-col"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 sm:mb-5 shrink-0">
                    <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg sm:text-xl mb-3">Psychiatre</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5 sm:mb-6 flex-1">
                    Le psychiatre est un médecin spécialisé en santé mentale. Il peut établir un
                    diagnostic médical, prescrire un traitement si nécessaire et assurer un suivi
                    clinique. Il intervient notamment dans les situations nécessitant une prise en
                    charge médicale.
                  </p>
                  <button
                    onClick={() => allerVersListe('psychiatre')}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold rounded-xl px-5 py-3 hover:bg-blue-700 transition-colors w-full sm:w-fit text-sm sm:text-base"
                  >
                    Choisir un psychiatre
                    <ArrowRightCircle className="w-4.5 h-4.5 shrink-0" />
                  </button>
                </motion.div>
              </div>

              {/* --------------------- COMMENT SE DÉROULE LE RENDEZ-VOUS --------------------- */}
              <div>
                <div className="text-center mb-8 sm:mb-10 px-2">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2">
                    Comment se déroule votre prise de rendez-vous ?
                  </h2>
                  <p className="text-slate-500 text-sm">Un parcours simple, pensé pour vous mettre à l'aise</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {etapes.map(({ icon: Icon, title, desc }, i) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="relative bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
                    >
                      <span className="absolute top-4 right-5 text-slate-100 font-extrabold text-2xl sm:text-3xl select-none">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                        <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-blue-600" />
                      </div>
                      <h3 className="text-slate-900 font-semibold text-sm mb-1.5 break-words">{title}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed break-words">{desc}</p>
                    </motion.div>
                  ))}
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
              className="px-0 sm:px-2 py-6 sm:py-8"
            >
              <div className="mb-6 sm:mb-8 px-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-1">
                  Nos professionnels certifiés
                </h2>
                <p className="text-slate-500 text-sm">Des experts qualifiés pour vous accompagner</p>
              </div>

              {/* Toolbar : recherche + filtre spécialité + tri */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-white border border-slate-100 rounded-2xl shadow-sm p-3 sm:p-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3.5 sm:px-4 py-2.5 border border-slate-200 w-full lg:flex-1 lg:max-w-md min-w-0">
                  <Search className="text-slate-400 w-4.5 h-4.5 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un nom ou une spécialité..."
                    className="bg-transparent border-none focus:ring-0 text-sm text-slate-700 placeholder:text-slate-400 w-full outline-none min-w-0"
                    aria-label="Rechercher un professionnel"
                  />
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-3 w-full lg:w-auto">
                  <div className="flex items-center gap-2.5 bg-white rounded-xl px-3.5 sm:px-4 py-2.5 border border-slate-200 shadow-sm min-w-0">
                    <Filter className="text-blue-600 w-4.5 h-4.5 shrink-0" />
                    <select
                      value={selectedSpecialite}
                      onChange={(e) => setSelectedSpecialite(e.target.value)}
                      className="appearance-none bg-transparent border-none focus:ring-0 text-slate-700 font-medium text-sm cursor-pointer min-w-0 w-full truncate"
                      aria-label="Filtrer par spécialité"
                    >
                      <option value="all">Toutes les spécialités</option>
                      {specialites.map((spec, idx) => (
                        <option key={idx} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2.5 bg-white rounded-xl px-3.5 sm:px-4 py-2.5 border border-slate-200 shadow-sm min-w-0">
                    <ArrowUpDown className="text-blue-600 w-4.5 h-4.5 shrink-0" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-transparent border-none focus:ring-0 text-slate-700 font-medium text-sm cursor-pointer min-w-0 w-full truncate"
                      aria-label="Trier les professionnels"
                    >
                      <option value="nom">Trier par nom</option>
                      <option value="specialite">Trier par spécialité</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-600 text-center mb-4 break-words px-2">{error}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 px-1 sm:px-0">
                {professionnelsAffiches.length === 0 ? (
                  <p className="col-span-full text-center text-slate-500 italic py-8">
                    Aucun professionnel ne correspond à votre recherche.
                  </p>
                ) : (
                  professionnelsPage.map((pro) => (
                    <motion.div
                      key={pro.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.35 }}
                      className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 flex flex-col"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 min-w-0">
                        <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm">
                          {getInitiales(pro.prenom, pro.nom)}
                        </div>
                        {/* min-w-0 empêche le nom du médecin d'être coupé sur mobile */}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight break-words">
                            Dr. {pro.prenom} {pro.nom}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 truncate">{pro.specialite}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full max-w-full">
                          {iconSpecialite(pro.specialite)}
                          <span className="truncate max-w-[110px] sm:max-w-none">{pro.specialite}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                          <BadgeCheck size={13} className="shrink-0" />
                          Vérifié
                        </span>
                      </div>

                      <button
                        onClick={() => fetchDisponibilites(pro.id)}
                        className="mt-auto w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 sm:gap-2.5 font-semibold text-sm transition-colors shadow-sm shadow-blue-600/20 active:scale-95"
                      >
                        <CalendarDays className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                        <span className="truncate">Voir les disponibilités</span>
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {professionnelsAffiches.length > 0 && totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 mb-10 px-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
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
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>
                </div>
              )}

              <div className="flex justify-center px-2">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl px-6 sm:px-8 py-3 transition-all active:scale-95 w-full sm:w-auto text-sm sm:text-base"
                  aria-label="Retour à l'introduction"
                >
                  <ArrowLeftCircle className="w-5 h-5 shrink-0" />
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
              className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
              onClick={() => setReservationIdPourPaiement(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="p-5 sm:p-6 bg-white rounded-t-3xl sm:rounded-2xl shadow-xl max-w-md w-full overflow-auto"
                style={{ maxHeight: '90vh', marginBottom: 'env(safe-area-inset-bottom)' }}
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