import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, ShieldCheck, BadgeCheck, Clock, Sparkles } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  const trustItems = [
    { icon: ShieldCheck, label: 'Données sécurisées' },
    { icon: BadgeCheck, label: 'Professionnels certifiés' },
    { icon: Clock, label: 'Disponible 24h/24' },
  ];

  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Formes abstraites en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-10 -left-10 w-72 h-72 bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/50 dark:bg-blue-800/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* ───────── Colonne gauche : texte ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center lg:text-left"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Votre bien-être, notre priorité
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4"
          >
            Prenez soin de votre{' '}
            <span className="text-blue-600">santé mentale</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed"
          >
            Votre espace de soutien et de ressources en santé mentale, accessible partout et en toute confidentialité.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/connexion')}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition text-sm sm:text-base"
            >
              Commencer maintenant
              <HeartPulse size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/apropos')}
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-slate-700 px-7 py-3 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-slate-700 transition text-sm sm:text-base"
            >
              Découvrir nos services
            </motion.button>
          </motion.div>

          {/* ───── Badges de confiance ───── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="grid sm:grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0"
          >
            {trustItems.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm"
              >
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ───────── Colonne droite : illustration ───────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="relative flex justify-center items-center h-[320px] sm:h-[400px] lg:h-[460px]"
        >
          {/* Cercle principal en dégradé */}
          <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-500 to-blue-300 rounded-full opacity-90 blur-[2px]" />
          <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-white/30 dark:bg-slate-900/30 rounded-full backdrop-blur-sm" />

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 bg-white dark:bg-slate-800 rounded-full shadow-2xl"
          >
            <HeartPulse className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600" strokeWidth={1.5} />
          </motion.div>

          {/* Carte flottante 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
            transition={{ delay: 0.8, duration: 0.6, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute top-4 left-0 sm:left-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2 border border-slate-100 dark:border-slate-700"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">100% confidentiel</span>
          </motion.div>

          {/* Carte flottante 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
            transition={{ delay: 1, duration: 0.6, y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute bottom-6 right-0 sm:right-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2 border border-slate-100 dark:border-slate-700"
          >
            <BadgeCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Pros qualifiés</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;