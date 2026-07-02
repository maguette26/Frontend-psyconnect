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
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ShieldCheck,
  Heart,
  CheckCircle2,
  Users,
  Smile,
  Star,
  Lock,
  Quote,
  Sprout,
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
        className="max-w-6xl mx-auto px-6 min-h-[70vh]"
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
              className="py-10 space-y-10"
            >
              {/* ---------- Bloc principal : titre + image ---------- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 bg-white text-blue-600 text-xs font-semibold px-4 py-2 rounded-full shadow-sm border border-blue-100 mb-5">
                    <ShieldCheck size={14} />
                    Plateforme de santé mentale sécurisée
                  </span>

                  <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-[1.15] mb-4">
                    Prenez soin de votre
                    <br />
                    <span className="inline-flex items-center gap-2 text-blue-600">
                      santé mentale
                      <Heart className="w-8 h-8 sm:w-9 sm:h-9 text-blue-500 fill-blue-100" />
                    </span>
                  </h1>

                  <p className="text-slate-500 text-base leading-relaxed max-w-md">
                    PsyConnect vous met en relation avec des professionnels qualifiés, à l'écoute de
                    vos besoins, pour vous accompagner vers un mieux-être durable.
                  </p>
                </div>

                <div className="relative">
                  <div className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-50">
                    {/* Remplacer par la photo définitive du projet */}
                    <img
                      src="https://picsum.photos/id/1027/900/700"
                      alt="Personne détendue chez elle"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>

                  <div className="absolute left-5 -bottom-6 sm:left-8 sm:-bottom-7 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 max-w-[260px] border border-slate-100">
                    <Quote className="w-5 h-5 text-blue-400 mb-1.5" />
                    <p className="text-slate-700 text-sm leading-snug">
                      La santé mentale est aussi importante que la santé physique. Vous n'êtes pas
                      seul.
                    </p>
                    <Heart className="w-4 h-4 text-blue-400 fill-blue-100 ml-auto mt-1" />
                  </div>
                </div>
              </div>

              {/* ---------- Comparatif Psychologue / Psychiatre ---------- */}
              <div className="pt-6">
                <h2 className="flex items-center justify-center gap-3 text-center text-lg sm:text-xl font-bold text-slate-800 mb-6">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Psychologue ou Psychiatre, quelle différence ?
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Psychologue */}
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-purple-700 font-bold text-lg mb-1">Psychologue</h3>
                    <p className="text-slate-500 text-sm mb-4">
                      Spécialiste de l'écoute et de l'accompagnement par la parole.
                    </p>
                    <ul className="space-y-2.5 mb-4">
                      {[
                        'Formé en psychologie (bac +5 minimum)',
                        'Accompagnement, thérapies et soutien psychologique',
                        'Ne prescrit pas de médicaments',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="bg-purple-50 rounded-xl p-3 text-xs text-purple-700 leading-relaxed">
                      <span className="font-semibold">Idéal pour :</span> stress, anxiété, difficultés
                      émotionnelles, confiance en soi, relations…
                    </div>
                  </div>

                  {/* Psychiatre */}
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-blue-700 font-bold text-lg mb-1">Psychiatre</h3>
                    <p className="text-slate-500 text-sm mb-4">
                      Médecin spécialisé en santé mentale et en troubles psychiatriques.
                    </p>
                    <ul className="space-y-2.5 mb-4">
                      {[
                        'Médecin spécialiste (bac +10 minimum)',
                        'Diagnostic médical et suivi thérapeutique',
                        'Peut prescrire des traitements médicamenteux',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 leading-relaxed">
                      <span className="font-semibold">Idéal pour :</span> troubles sévères, dépression,
                      troubles bipolaires, schizophrénie, addictions…
                    </div>
                  </div>

                  {/* Pourquoi choisir PsyConnect */}
                  <div className="bg-blue-600 rounded-2xl shadow-sm p-6 text-white flex flex-col justify-center gap-4">
                    <h3 className="font-bold text-lg mb-1">Pourquoi choisir PsyConnect ?</h3>
                    {[
                      { icon: ShieldCheck, title: 'Professionnels certifiés', desc: 'Des experts qualifiés et vérifiés.' },
                      { icon: CalendarDays, title: 'Réservation simplifiée', desc: 'Trouvez et réservez en quelques clics.' },
                      { icon: Lock, title: 'Confidentialité garantie', desc: 'Vos échanges sont 100% sécurisés.' },
                      { icon: Heart, title: 'À votre rythme', desc: 'Des solutions adaptées à vos besoins.' },
                    ].map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex items-start gap-3">
                        <div className="shrink-0 w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{title}</p>
                          <p className="text-blue-100 text-xs">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ---------- Stats + CTA ---------- */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-stretch">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: Users, value: '350+', label: 'Professionnels certifiés' },
                    { icon: Smile, value: '12 000+', label: 'Patients accompagnés' },
                    { icon: Star, value: '4,9/5', label: 'Satisfaction moyenne' },
                    { icon: ShieldCheck, value: '100%', label: 'Données sécurisées' },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5 text-blue-600" />
                      </div>
                      <div className="leading-tight">
                        <p className="font-extrabold text-slate-900 text-lg">{value}</p>
                        <p className="text-slate-400 text-xs">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col justify-center gap-3">
                  <Sprout className="absolute -bottom-2 -right-2 w-16 h-16 text-blue-50" />
                  <p className="relative text-slate-800 font-semibold text-sm">
                    Prêt à commencer votre parcours vers le mieux-être ?
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(2)}
                    className="relative inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold rounded-xl px-5 py-2.5 shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-all w-fit"
                  >
                    Découvrir nos professionnels
                    <ArrowRightCircle className="w-4.5 h-4.5" />
                  </motion.button>
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