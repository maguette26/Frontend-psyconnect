import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/commun/Layout';
import { Smile, Frown, Moon, CheckCircle, RefreshCcw, ChevronLeft, ArrowRight } from 'lucide-react';
import {  AnimatePresence } from 'framer-motion';

const champs = [
  {
    key: 'humeur',
    label: 'Humeur',
    description: 'Comment vous sentez-vous émotionnellement ?',
    emoji: ['😞', '😕', '😐', '🙂', '😄'],
    color: 'indigo',
  },
  {
    key: 'stress',
    label: 'Stress',
    description: 'Quel est votre niveau de stress aujourd\'hui ?',
    emoji: ['😰', '😟', '😐', '😌', '😎'],
    color: 'violet',
  },
  {
    key: 'sommeil',
    label: 'Sommeil',
    description: 'Comment avez-vous dormi cette nuit ?',
    emoji: ['😴', '🥱', '😐', '😊', '⭐'],
    color: 'sky',
  },
];

const colorMap = {
  indigo: {
    track: 'accent-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-600',
    text: 'text-indigo-600',
    bar: 'from-indigo-400 to-indigo-600',
  },
  violet: {
    track: 'accent-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-600',
    text: 'text-violet-600',
    bar: 'from-violet-400 to-violet-600',
  },
  sky: {
    track: 'accent-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    badge: 'bg-sky-600',
    text: 'text-sky-600',
    bar: 'from-sky-400 to-sky-600',
  },
};

const getLabel = (value) => {
  const labels = ['Très bas', 'Bas', 'Moyen', 'Bon', 'Excellent'];
  return labels[value - 1];
};

const getMoyenneLabel = (avg) => {
  if (avg < 2) return { text: 'Attention requise', color: 'text-red-500', bg: 'bg-red-50 border-red-200' };
  if (avg < 3) return { text: 'À surveiller', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' };
  if (avg < 4) return { text: 'Correct', color: 'text-indigo-500', bg: 'bg-indigo-50 border-indigo-200' };
  return { text: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' };
};

const AutoEvaluationBasique = () => {
  const [scores, setScores] = useState({ humeur: 3, stress: 3, sommeil: 3 });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setScores(prev => ({ ...prev, [name]: Number(value) }));
  };

  const moyenne = ((scores.humeur + scores.stress + scores.sommeil) / 3);
  const moyenneAff = moyenne.toFixed(1);
  const moyenneLabel = getMoyenneLabel(moyenne);

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
            📝 Auto-Évaluation
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bilan de bien-être</h1>
          <p className="text-gray-500 mt-2">Prenez 2 minutes pour évaluer comment vous vous sentez aujourd'hui</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="space-y-4 mb-6">
                  {champs.map((champ) => {
                    const c = colorMap[champ.color];
                    const val = scores[champ.key];
                    return (
                      <div key={champ.key} className={`${c.bg} border ${c.border} rounded-3xl p-6`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{champ.label}</h3>
                            <p className="text-gray-500 text-sm">{champ.description}</p>
                          </div>
                          <div className="text-4xl">{champ.emoji[val - 1]}</div>
                        </div>

                        <input
                          type="range"
                          name={champ.key}
                          min="1"
                          max="5"
                          step="1"
                          value={val}
                          onChange={handleChange}
                          className={`w-full h-2 ${c.track} cursor-pointer mb-3`}
                        />

                        {/* Labels 1-5 */}
                        <div className="flex justify-between text-xs text-gray-400">
                          {['Très bas', 'Bas', 'Moyen', 'Bon', 'Excellent'].map((l, i) => (
                            <span
                              key={i}
                              className={`transition-all ${val === i + 1 ? `${c.text} font-bold` : ''}`}
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setSubmitted(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-semibold text-base transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  <CheckCircle size={20} />
                  Voir mon bilan
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Score global */}
                <div className={`border rounded-3xl p-8 mb-4 text-center ${moyenneLabel.bg}`}>
                  <p className="text-sm text-gray-500 mb-1 uppercase tracking-widest font-semibold">Score global</p>
                  <div className={`text-6xl font-bold ${moyenneLabel.color} mb-1`}>{moyenneAff}<span className="text-2xl text-gray-400">/5</span></div>
                  <span className={`inline-block text-sm font-bold px-4 py-1.5 rounded-full ${moyenneLabel.color} bg-white border`}>
                    {moyenneLabel.text}
                  </span>

                  {/* Barre de progression */}
                  <div className="mt-6 h-3 bg-white/60 rounded-full overflow-hidden border border-white">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(moyenne / 5) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Détail par critère */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {champs.map((champ) => {
                    const c = colorMap[champ.color];
                    const val = scores[champ.key];
                    return (
                      <div key={champ.key} className={`${c.bg} border ${c.border} rounded-2xl p-4 text-center`}>
                        <div className="text-2xl mb-1">{champ.emoji[val - 1]}</div>
                        <div className={`text-xl font-bold ${c.text}`}>{val}/5</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">{champ.label}</div>
                        <div className="text-xs text-gray-400">{getLabel(val)}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-all"
                  >
                    <RefreshCcw size={16} /> Refaire
                  </button>
                  <button
                    onClick={() => navigate('/ressources')}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-all"
                  >
                    Ressources <ArrowRight size={16} />
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

export default AutoEvaluationBasique;