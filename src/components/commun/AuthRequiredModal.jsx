import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, X, LogIn, UserPlus } from 'lucide-react';

const AuthRequiredModal = ({ open, onClose, title, message, icon: Icon = Lock }) => {
  const navigate = useNavigate();

  const go = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pt-9 pb-2 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg shadow-blue-600/25 flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 px-8 text-center">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 text-center px-8 leading-relaxed">
                {message}
              </p>
            </div>

            <div className="flex flex-col gap-2 p-6 pt-5">
              <button
                onClick={() => go('/connexion')}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition"
              >
                <LogIn className="w-4 h-4" /> Se connecter
              </button>
              <button
                onClick={() => go('/inscription')}
                className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm py-2.5 rounded-xl border border-slate-200 transition"
              >
                <UserPlus className="w-4 h-4" /> Créer un compte
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthRequiredModal;