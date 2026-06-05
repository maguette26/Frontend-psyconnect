import React from 'react';
import { ShieldCheck, Heart, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const points = [
  {
    icon: <ShieldCheck className="h-10 w-10 text-indigo-600" />,
    titre: "Confidentialité garantie",
    texte: "Vos données et vos échanges sont strictement confidentiels, protégés et sécurisés.",
  },
  {
    icon: <Heart className="h-10 w-10 text-indigo-600" />,
    titre: "Approche humaine",
    texte: "Notre mission est de vous accompagner avec bienveillance et respect.",
  },
  {
    icon: <Headphones className="h-10 w-10 text-indigo-600" />,
    titre: "Support réactif",
    texte: "Une équipe disponible pour vous aider à chaque étape.",
  },
];

const PourquoiNous = () => {
  return (
    <section className="mt-20 max-w-6xl mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-12">Pourquoi choisir PsyConnect ?</h2>
      <div className="grid md:grid-cols-3 gap-10">
        {points.map((point, index) => (
          <motion.div
            key={index}
            className="bg-white p-8 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="mb-5 flex justify-center">{point.icon}</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">{point.titre}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{point.texte}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PourquoiNous;
