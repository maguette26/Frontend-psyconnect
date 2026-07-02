// src/pages/Inscription.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/commun/Layout';
import { UserPlus, Stethoscope, HeartPulse, ArrowRight } from 'lucide-react';

const Inscription = () => {
  return (
    <Layout>
      <div className="pc-body min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-16">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
          .pc-display { font-family: 'Sora', system-ui, sans-serif; }
          .pc-body { font-family: 'Inter', system-ui, sans-serif; }
          .pc-card { animation: pc-card-in 0.6s ease both; }
          @keyframes pc-card-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .pc-choice { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
          .pc-choice:hover { transform: translateY(-3px); }
          @media (prefers-reduced-motion: reduce) {
            .pc-card { animation: none; }
            .pc-choice:hover { transform: none; }
          }
        `}</style>

        <div className="pc-card w-full max-w-xl bg-white rounded-[30px] shadow-[0_25px_70px_-20px_rgba(37,99,235,0.22)] p-10">

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="pc-display text-lg font-bold text-slate-900">PsyConnect</span>
          </div>

          <h2 className="pc-display text-center text-3xl font-bold text-slate-900 mb-2">
            Rejoindre PsyConnect
          </h2>
          <p className="text-center text-slate-500 mb-9">
            Choisissez le type de compte qui vous correspond.
          </p>

          <div className="space-y-4">
            <Link
              to="/inscription/utilisateur"
              className="pc-choice flex items-center gap-4 w-full px-6 py-5 rounded-2xl bg-blue-50/60 border border-blue-100 hover:border-blue-300 hover:bg-blue-50 no-underline"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold text-slate-900">Je suis un utilisateur</p>
                <p className="text-sm text-slate-500">Accédez à un accompagnement personnalisé.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600 shrink-0" />
            </Link>

            <Link
              to="/inscription/professionnel"
              className="pc-choice flex items-center gap-4 w-full px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 no-underline"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold text-slate-900">Je suis un professionnel de santé mentale</p>
                <p className="text-sm text-slate-500">Rejoignez notre réseau de praticiens certifiés.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
            </Link>
          </div>

          <p className="text-sm text-center mt-9 text-slate-500">
            Vous avez déjà un compte ?{' '}
            <Link to="/connexion" className="text-blue-600 font-semibold hover:underline">
              Connectez-vous ici
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Inscription;