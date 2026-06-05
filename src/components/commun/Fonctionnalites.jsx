import React from 'react';
import { Stethoscope, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const fonctionnalites = [
  {
    titre: 'Consulter un professionnel',
    description: 'Prenez rendez-vous avec un psychologue ou un psychiatre qualifié en toute confidentialité.',
    icon: <Stethoscope className="h-8 w-8 text-indigo-600" />,
  },
  {
    titre: 'Accéder à des ressources',
    description: 'Lisez des articles fiables, des conseils et des exercices pour prendre soin de votre santé mentale.',
    icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
  },
  {
    titre: 'Partager avec la communauté',
    description: 'Exprimez-vous librement dans un espace bienveillant et anonyme grâce au forum public.',
    icon: <Users className="h-8 w-8 text-indigo-600" />,
  },
];

const Fonctionnalites = () => {
  return (
    <section className="mt-20 max-w-7xl mx-auto px-4 text-center">
      <motion.h2
        className="text-3xl font-bold text-gray-800 mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Nos fonctionnalités principales
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-8">
        {fonctionnalites.map((fct, index) => (
          <motion.div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex justify-center mb-4">{fct.icon}</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{fct.titre}</h3>
            <p className="text-gray-600 text-sm">{fct.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Fonctionnalites;
