import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, BookOpen, Users, Bot, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const fonctionnalites = [
  {
    titre: 'Consulter un professionnel',
    description: 'Prenez rendez-vous avec un psychologue ou un psychiatre qualifié en toute confidentialité.',
    icon: Stethoscope,
    route: '/reservation',
    cta: 'Voir les professionnels',
  },
  {
    titre: 'Accéder à des ressources',
    description: 'Lisez des articles fiables, des conseils et des exercices pour prendre soin de votre santé mentale.',
    icon: BookOpen,
    route: '/ressources',
    cta: 'Explorer les ressources',
  },
  {
    titre: 'Partager avec la communauté',
    description: 'Exprimez-vous librement dans un espace bienveillant et anonyme grâce au forum public.',
    icon: Users,
    route: '/forum',
    cta: 'Accéder au forum',
  },
  {
    titre: 'PsyBotAI',
    description: 'Discutez avec notre assistant IA pour obtenir un soutien et des recommandations personnalisées.',
    icon: Bot,
    route: '/chatbot',
    cta: 'Parler à PsyBotAI',
  },
];

const Fonctionnalites = () => {
  const navigate = useNavigate();

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
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
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

              <button
                onClick={() => navigate(fct.route)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:gap-2.5 transition-all"
              >
                {fct.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Fonctionnalites;