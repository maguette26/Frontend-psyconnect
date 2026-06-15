import React from 'react';
import { ShieldCheck, Heart, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const points = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-indigo-600" />,
    titre: "Confidentialité garantie",
    texte: "Vos données et vos échanges sont strictement confidentiels, protégés et sécurisés.",
  },
  {
    icon: <Heart className="h-8 w-8 text-indigo-600" />,
    titre: "Approche humaine",
    texte: "Notre mission est de vous accompagner avec bienveillance et respect.",
  },
  {
    icon: <Headphones className="h-8 w-8 text-indigo-600" />,
    titre: "Support réactif",
    texte: "Une équipe disponible pour vous aider à chaque étape.",
  },
];

const PourquoiNous = () => {
  return (
    <section className="mt-12 sm:mt-20 max-w-6xl mx-auto px-4 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-12">
        Pourquoi choisir PsyConnect ?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
        {points.map((point, index) => (
          <motion.div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
          >
            <div className="bg-indigo-50 p-4 rounded-xl mb-4">
              {point.icon}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">{point.titre}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{point.texte}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PourquoiNous;