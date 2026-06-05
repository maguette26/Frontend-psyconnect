import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/commun/Layout';
import { ArrowRight, ArrowLeft, CheckCircle, RefreshCcw, ChevronLeft, Wind, PenLine, Footprints } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const etapes = [
  {
    titre: 'Respiration',
    texte: 'Respirez profondément pendant 2 minutes.',
    detail: 'Inspirez lentement par le nez (4s), retenez (4s), expirez par la bouche (6s). Répétez.',
    icon: Wind,
    color: 'from-indigo-50 to-indigo-100',
    accent: 'bg-indigo-600',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
  },
  {
    titre: 'Gratitude',
    texte: 'Écrivez trois choses pour lesquelles vous êtes reconnaissant aujourd\'hui.',
    detail: 'Prenez un stylo ou notez dans votre tête. Soyez précis et sincère dans chaque gratitude.',
    icon: PenLine,
    color: 'from-violet-50 to-violet-100',
    accent: 'bg-violet-600',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    borderColor: 'border-violet-200',
  },
  {
    titre: 'Mouvement',
    texte: 'Faites une marche de 5 minutes à l\'extérieur.',
    detail: 'Laissez votre téléphone derrière vous. Observez l\'environnement, respirez l\'air frais.',
    icon: Footprints,
    color: 'from-emerald-50 to-emerald-100',
    accent: 'bg-emerald-600',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  },
];

const MiniDefiDecouverte = () => {
  const [etape, setEtape] = useState(0);
  const [termine, setTermine] = useState(false);
  const [reflexion, setReflexion] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEtape = localStorage.getItem('miniDefiDecouverteEtape');
    const savedTermine = localStorage.getItem('miniDefiDecouverteTermine');
    if (savedEtape) setEtape(Number(savedEtape));
    if (savedTermine === 'true') setTermine(true);
  }, []);

  useEffect(() => {
    if (termine) {
      const timer = setTimeout(() => navigate('/ressources'), 5000);
      return () => clearTimeout(timer);
    }
  }, [termine, navigate]);

  const suivant = () => {
    if (etape + 1 < etapes.length) {
      setEtape(prev => prev + 1);
      localStorage.setItem('miniDefiDecouverteEtape', etape + 1);
      setReflexion('');
    } else {
      setTermine(true);
      localStorage.setItem('miniDefiDecouverteTermine', 'true');
    }
  };

  const precedent = () => setEtape(prev => Math.max(prev - 1, 0));

  const reset = () => {
    setEtape(0);
    setReflexion('');
    setTermine(false);
    localStorage.removeItem('miniDefiDecouverteEtape');
    localStorage.removeItem('miniDefiDecouverteTermine');
  };

  const current = etapes[etape];
  const IconComponent = current.icon;
  const progress = ((etape) / etapes.length) * 100;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white py-8 px-4">
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
            🔍 Mini Défi Découverte
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Exploration du bien-être</h1>
          <p className="text-gray-500 mt-2">3 étapes simples pour vous reconnecter à vous-même</p>
        </div>

        {/* Steps indicator */}
        {!termine && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex items-center justify-between mb-2">
              {etapes.map((e, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0 ${
                    i < etape ? 'bg-indigo-600 text-white' :
                    i === etape ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {i < etape ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === etape ? 'text-indigo-700' : 'text-gray-400'}`}>
                    {e.titre}
                  </span>
                  {i < etapes.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full bg-indigo-500 transition-all duration-500 ${i < etape ? 'w-full' : 'w-0'}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {!termine ? (
              <motion.div
                key={etape}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {/* Étape card */}
                <div className={`bg-gradient-to-br ${current.color} border ${current.borderColor} rounded-3xl p-8 mb-4`}>
                  <div className="flex items-start gap-5">
                    <div className={`${current.iconBg} p-4 rounded-2xl flex-shrink-0`}>
                      <IconComponent size={28} className={current.iconColor} />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Étape {etape + 1} sur {etapes.length}</div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{current.titre}</h2>
                      <p className="text-gray-700 text-lg leading-relaxed">{current.texte}</p>
                      <p className="text-gray-500 text-sm mt-2 italic">{current.detail}</p>
                    </div>
                  </div>
                </div>

                {/* Reflexion */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-4 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <PenLine size={16} className="text-indigo-500" />
                    Votre ressenti après cette étape
                  </label>
                  <textarea
                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none text-gray-700 placeholder-gray-400"
                    value={reflexion}
                    onChange={(e) => setReflexion(e.target.value)}
                    rows={3}
                    placeholder="Comment vous sentez-vous ? Notez vos pensées librement..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {etape > 0 && (
                    <button
                      onClick={precedent}
                      className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-all"
                    >
                      <ArrowLeft size={16} /> Précédent
                    </button>
                  )}
                  <button
                    onClick={suivant}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <CheckCircle size={18} />
                    {etape === etapes.length - 1 ? 'Terminer le défi' : 'Étape suivante'}
                    {etape < etapes.length - 1 && <ArrowRight size={16} />}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-emerald-50 to-indigo-50 border border-emerald-200 rounded-3xl p-10 text-center"
              >
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Défi complété !</h2>
                <p className="text-gray-600 mb-6">Bravo ! Vous avez complété les 3 étapes. Redirection vers les ressources dans quelques secondes...</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-5 py-3 border border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 font-medium transition-all"
                  >
                    <RefreshCcw size={16} /> Refaire le défi
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

export default MiniDefiDecouverte;