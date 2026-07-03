import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, BookOpen, Users, Bot, ArrowRight, LogIn, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUserInfo } from '../../services/serviceAuth';

const fonctionnalites = [
  {
    titre: 'Consulter un professionnel',
    description: 'Prenez rendez-vous avec un psychologue ou un psychiatre qualifié en toute confidentialité.',
    icon: Stethoscope,
    route: '/reservation',
    cta: 'Voir les professionnels',
    requiresAuth: true,
  },
  {
    titre: 'Accéder à des ressources',
    description: 'Lisez des articles fiables, des conseils et des exercices pour prendre soin de votre santé mentale.',
    icon: BookOpen,
    route: '/ressources',
    cta: 'Explorer les ressources',
    requiresAuth: true,
  },
  {
    titre: 'Partager avec la communauté',
    description: 'Exprimez-vous librement dans un espace bienveillant et anonyme grâce au forum public.',
    icon: Users,
    route: '/forum',
    cta: 'Accéder au forum',
    requiresAuth: true,
  },
  {
    titre: 'PsyBotAI',
    description: 'Discutez avec notre assistant IA pour obtenir un soutien et des recommandations personnalisées.',
    icon: Bot,
    route: '/chatbot',
    cta: 'Parler à PsyBotAI',
    requiresAuth: false, // accessible sans connexion
  },
];

const Fonctionnalites = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isAuthenticated = () => {
    try {
      const profil = getCurrentUserInfo();
      return !!(profil && profil.token);
    } catch {
      return false;
    }
  };

  const handleNavigate = (fct) => {
    if (fct.requiresAuth && !isAuthenticated()) {
      setAuthModalOpen(true);
      return;
    }
    navigate(fct.route);
  };

  return (
    <section className="mt-12 sm:mt-20 max-w-7xl mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-10 sm:mb-14"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">
          Nos fonctionnalités principales
        </h2>
        <p className="text-slate-500 text-sm sm:text-base">
          Des outils complets pour prendre soin de votre santé mentale
        </p>
        <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {fonctionnalites.map((fct, index) => {
          const Icon = fct.icon;
          return (
            <motion.div
              key={fct.titre}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}transition={{
  delay: index * 0.1,
  duration: 0.4,
  ease: "easeOut",
}}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-4">
                <Icon className="h-7 w-7 text-blue-600" strokeWidth={1.8} />
              </div>

              <h3 className="text-base font-semibold text-slate-800 mb-2">
                {fct.titre}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1">
                {fct.description}
              </p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNavigate(fct)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 hover:bg-blue-700 hover:shadow-md transition-all"
              >
                {fct.cta}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Modal auth requise */}
      <AnimatePresence>
        {authModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setAuthModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center relative"
            >
              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <LogIn className="w-7 h-7 text-blue-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Connexion requise
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Vous devez être connecté pour accéder à cette fonctionnalité.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/connexion')}
                  className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className="w-full text-slate-500 font-medium py-2 hover:text-slate-700 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Fonctionnalites;