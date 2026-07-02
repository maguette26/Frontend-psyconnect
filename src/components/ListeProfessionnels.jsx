import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

import Header from './commun/header';
import PiedPage from './commun/PiedPage';
import PaymentForm from './utilisateur/PaymentForm';
import DisponibilitesModal from './utilisateur/DisponibilitesModal';
import ModalPortal from './ModalPortal';

const DUREE_CONSULTATION_MINUTES = 45;

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

  const professionnelsFiltres = selectedSpecialite === 'all'
    ? professionnels
    : professionnels.filter(pro => pro.specialite === selectedSpecialite);

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
                initial: { opacity: 0, scale: 0.95, y: 20 },
                animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
                exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.5, ease: "easeIn" } }
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full min-h-[42vh] text-center px-8 py-10 bg-gradient-to-br from-blue-50 via-blue-50/60 to-white overflow-hidden flex flex-col justify-center rounded-3xl mt-6"
            >
              <div
                aria-hidden="true"
                className="absolute -top-28 -left-28 w-80 h-80 bg-blue-200 rounded-full opacity-30 filter blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-32 -right-24 w-96 h-96 bg-blue-300 rounded-full opacity-20 filter blur-3xl"
              />

              <span className="relative inline-flex items-center gap-2 bg-white text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 mx-auto shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Nos professionnels
              </span>

              <h1 className="relative text-3xl font-extrabold text-slate-900 mb-3 leading-snug tracking-tight">
                Bienvenue sur <span className="text-blue-600">PsyConnect</span>
              </h1>
              <h2 className="relative text-base text-slate-600 mb-8 max-w-xl mx-auto">
                Votre passerelle vers des professionnels de santé mentale qualifiés et à l'écoute.
              </h2>

              <div className="relative max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-6">
                <div className="flex items-start gap-4 bg-white/70 backdrop-blur-sm rounded-2xl p-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 shrink-0">
                    <HeartPulse className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Psychologues</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Professionnels formés à l'écoute et à l'accompagnement par la parole, ils vous aident à surmonter vos difficultés à travers des thérapies adaptées.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/70 backdrop-blur-sm rounded-2xl p-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 shrink-0">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Psychiatres</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Médecins spécialisés en santé mentale, capables de poser un diagnostic médical, prescrire des traitements et assurer un suivi global.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white font-semibold rounded-xl px-8 py-3.5 shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
                  aria-label="Découvrir nos professionnels"
                >
                  Découvrir nos professionnels
                  <ArrowRightCircle className="w-5 h-5" />
                </motion.button>
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
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">
                    Nos professionnels certifiés
                  </h2>
                  <p className="text-slate-500 text-sm">Des experts qualifiés pour vous accompagner</p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 border border-slate-200 shadow-sm">
                    <Filter className="text-blue-600 w-5 h-5" />
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
                </div>
              </div>

              {error && <p className="text-red-600 text-center mb-4">{error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {professionnelsFiltres.length === 0 ? (
                  <p className="col-span-full text-center text-slate-500 italic py-8">
                    Aucun professionnel ne correspond à cette spécialité.
                  </p>
                ) : (
                  professionnelsFiltres.map((pro) => (
                    <motion.div
                      key={pro.id}
                      whileHover={{ y: -4 }}
                      className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow p-6 flex flex-col"
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

                      <div className="flex items-center gap-2 mb-5">
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