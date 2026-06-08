import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

const Blob = ({ className, style, animate }) => (
  <motion.div
    className={`absolute rounded-full opacity-20 ${className}`}
    style={style}
    animate={animate}
    transition={{ repeat: Infinity, repeatType: 'reverse', duration: 12, ease: 'easeInOut' }}
  />
);

const Hero = () => {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative bg-gradient-to-br from-indigo-100 via-indigo-50 to-white px-4 sm:px-6 py-16 sm:py-24 text-center rounded-2xl w-full max-w-4xl mx-auto shadow-xl overflow-hidden"
    >
      <Blob className="bg-indigo-300" style={{ width: 120, height: 120, top: 10, left: 10 }} animate={{ scale: [1, 1.3, 1] }} />
      <Blob className="bg-indigo-400" style={{ width: 180, height: 180, bottom: 20, right: 20 }} animate={{ scale: [1, 1.2, 1] }} />
      <Blob className="bg-indigo-200" style={{ width: 100, height: 100, top: 80, right: 40 }} animate={{ scale: [1, 1.25, 1] }} />

      <motion.div
        className="hidden sm:block absolute top-8 left-8 text-indigo-300"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <HeartPulse size={70} className="drop-shadow-md" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-3xl sm:text-5xl font-extrabold text-indigo-900 mb-4 drop-shadow-lg relative z-10"
      >
        Bienvenue sur PsyConnect
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="text-indigo-700 text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed relative z-10"
      >
        Votre espace de soutien et de ressources en santé mentale, accessible partout et en toute confidentialité.
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/connexion')}
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 sm:px-10 py-3 rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition relative z-10 text-sm sm:text-base"
      >
        Accéder aux fonctionnalités
        <HeartPulse size={20} className="text-white animate-pulse" />
      </motion.button>
    </motion.section>
  );
};

export default Hero;