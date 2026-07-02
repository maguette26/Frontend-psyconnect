import React from 'react';
import { ShieldCheck, Heart, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const points = [
  {
    icon: ShieldCheck,
    titre: "Confidentialité garantie",
    texte: "Vos données et vos échanges sont strictement confidentiels, protégés et sécurisés.",
  },
  {
    icon: Heart,
    titre: "Approche humaine",
    texte: "Notre mission est de vous accompagner avec bienveillance et respect.",
  },
  {
    icon: Headphones,
    titre: "Support réactif",
    texte: "Une équipe disponible pour vous aider à chaque étape.",
  },
];

const PourquoiNous = () => {
  return (
    <section className="mt-12 sm:mt-20 max-w-6xl mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-10 sm:mb-14"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">
          Pourquoi choisir PsyConnect ?
        </h2>
        <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {points.map((point, index) => {
          const Icon = point.icon;
          return (
            <motion.div
              key={point.titre}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-100 p-7 rounded-2xl shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 mb-5">
                <Icon className="h-8 w-8 text-blue-600" strokeWidth={1.8} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
                {point.titre}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {point.texte}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default PourquoiNous;