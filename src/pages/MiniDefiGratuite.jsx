import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/commun/Layout';
import { CheckCircle, RefreshCcw, ChevronLeft, ArrowRight, Wind, Monitor, Droplets, BookOpen, Sun, Footprints, Dumbbell, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const defis = [
  { titre: 'Jour 1', texte: 'Faites 5 minutes de respiration profonde.', icon: Wind, color: 'indigo' },
  { titre: 'Jour 2', texte: 'Déconnectez-vous des écrans pendant 10 minutes.', icon: Monitor, color: 'violet' },
  { titre: 'Jour 3', texte: 'Buvez un grand verre d\'eau au réveil.', icon: Droplets, color: 'sky' },
  { titre: 'Jour 4', texte: 'Faites 5 minutes de respiration profonde.', icon: Wind, color: 'indigo' },
  { titre: 'Jour 5', texte: 'Lisez un livre pendant 10 minutes.', icon: BookOpen, color: 'amber' },
  { titre: 'Jour 6', texte: 'Sortez prendre l\'air pendant 10 minutes.', icon: Sun, color: 'emerald' },
  { titre: 'Jour 6', texte: 'Faites des étirements pendant 10 minutes.', icon: Dumbbell, color: 'rose' },
  { titre: 'Jour 7', texte: 'Mangez sainement.', icon: Apple, color: 'green' },
];

const colorMap = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-100 text-indigo-600', badge: 'bg-indigo-600' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'bg-violet-100 text-violet-600', badge: 'bg-violet-600' },
  sky:    { bg: 'bg-sky-50',    border: 'border-sky-200',    icon: 'bg-sky-100 text-sky-600',    badge: 'bg-sky-600' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  icon: 'bg-amber-100 text-amber-600',  badge: 'bg-amber-600' },
  emerald:{ bg: 'bg-emerald-50',border: 'border-emerald-200',icon: 'bg-emerald-100 text-emerald-600',badge: 'bg-emerald-600' },
  rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   icon: 'bg-rose-100 text-rose-600',   badge: 'bg-rose-600' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  icon: 'bg-green-100 text-green-600',  badge: 'bg-green-600' },
};

const MiniDefiGratuite = () => {
  const [jourActuel, setJourActuel] = useState(0);
  const [termine, setTermine] = useState(false);
  const [reflexion, setReflexion] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedDay = localStorage.getItem('miniDefiJour');
    const savedTermine = localStorage.getItem('miniDefiGratuiteTermine');
    if (savedDay) setJourActuel(Number(savedDay));
    if (savedTermine === 'true') setTermine(true);
  }, []);

  useEffect(() => {
    if (termine) {
      const timer = setTimeout(() => navigate('/ressources'), 5000);
      return () => clearTimeout(timer);
    }
  }, [termine, navigate]);

  const handleSuivant = () => {
    if (jourActuel + 1 < defis.length) {
      setJourActuel((prev) => prev + 1);
      localStorage.setItem('miniDefiJour', jourActuel + 1);
      setReflexion('');
    } else {
      setTermine(true);
      localStorage.setItem('miniDefiGratuiteTermine', 'true');
    }
  };

  const handleReset = () => {
    setJourActuel(0);
    setReflexion('');
    setTermine(false);
    localStorage.removeItem('miniDefiJour');
    localStorage.removeItem('miniDefiGratuiteTermine');
  };

  const current = defis[jourActuel];
  const colors = colorMap[current.color];
  const IconComponent = current.icon;
  const progressPct = Math.round(((jourActuel) / defis.length) * 100);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-white py-8 px-4">
        {/* Bouton retour */}
        <div className="max-w-2xl mx-auto mb-6">
          <button
            onClick={() => navigate('/ressources')}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            Retour aux ressources
          </button>
        </div>

        {/* Header */}
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 uppercase tracking-widest">
            📅 Mini Défi Gratuit
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Programme 7 jours</h1>
          <p className="text-gray-500 mt-2">Un petit défi quotidien pour prendre soin de vous</p>
        </div>

        {/* Progress bar */}
        {!termine && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{jourActuel} / {defis.length} jours complétés</span>
              <span className="font-semibold text-indigo-600">{progressPct}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>

            {/* Mini dots pour chaque jour */}
            <div className="flex gap-1.5 mt-3 justify-center flex-wrap">
              {defis.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i < jourActuel ? 'bg-indigo-500' :
                    i === jourActuel ? 'bg-indigo-400 ring-2 ring-indigo-200' :
                    'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {!termine ? (
              <motion.div
                key={jourActuel}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Défi card */}
                <div className={`${colors.bg} border ${colors.border} rounded-3xl p-8 mb-4`}>
                  <div className="flex items-start gap-5">
                    <div className={`${colors.icon.split(' ')[0]} p-4 rounded-2xl flex-shrink-0`}>
                      <IconComponent size={28} className={colors.icon.split(' ')[1]} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                          {current.titre}
                        </span>
                        <span className="text-xs text-gray-400">{jourActuel + 1} sur {defis.length}</span>
                      </div>
                      <p className="text-gray-800 text-xl font-semibold leading-relaxed">{current.texte}</p>
                    </div>
                  </div>
                </div>

                {/* Reflexion */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-4 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    📝 Qu'avez-vous ressenti après ce défi ?
                  </label>
                  <textarea
                    value={reflexion}
                    onChange={(e) => setReflexion(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none text-gray-700 placeholder-gray-400"
                    rows={3}
                    placeholder="Partagez votre expérience du jour..."
                  />
                </div>

                <button
                  onClick={handleSuivant}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-semibold text-base transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  <CheckCircle size={20} />
                  {jourActuel === defis.length - 1 ? 'Terminer le programme' : 'Valider et passer au suivant'}
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-emerald-50 to-indigo-50 border border-emerald-200 rounded-3xl p-10 text-center"
              >
                <div className="text-5xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Programme terminé !</h2>
                <p className="text-gray-600 mb-6">
                  Bravo ! Vous avez complété les 7 jours du défi. Redirection vers les ressources...
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-5 py-3 border border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 font-medium transition-all"
                  >
                    <RefreshCcw size={16} /> Recommencer
                  </button>
                  <button
                    onClick={() => navigate('/ressources')}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-all"
                  >
                    Retour aux ressources <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default MiniDefiGratuite;