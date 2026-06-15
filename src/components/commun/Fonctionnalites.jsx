import React from 'react';
import { Stethoscope, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const fonctionnalites = [
  {
    titre: 'Consulter un professionnel',
    description: 'Prenez rendez-vous avec un psychologue ou un psychiatre qualifié en toute confidentialité.',
    icon: <Stethoscope className="h-7 w-7 text-indigo-600" />,
  },
  {
    titre: 'Accéder à des ressources',
    description: 'Lisez des articles fiables, des conseils et des exercices pour prendre soin de votre santé mentale.',
    icon: <BookOpen className="h-7 w-7 text-indigo-600" />,
  },
  {
    titre: 'Partager avec la communauté',
    description: 'Exprimez-vous librement dans un espace bienveillant et anonyme grâce au forum public.',
    icon: <Users className="h-7 w-7 text-indigo-600" />,
  },
];

const Fonctionnalites = () => {
  return (
    <section className="mt-12 sm:mt-20 max-w-7xl mx-auto px-4 text-center">
      <motion.h2
        className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Nos fonctionnalités principales
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {fonctionnalites.map((fct, index) => (
          <motion.div
            key={index}
            className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex justify-center mb-3">
              <div className="bg-indigo-50 p-3 rounded-xl">
                {fct.icon}
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">{fct.titre}</h3>
            <p className="text-gray-500 text-sm">{fct.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Fonctionnalites;