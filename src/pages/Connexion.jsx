// src/pages/Connexion.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, HeartPulse, ArrowRight } from 'lucide-react';
import { login } from '../services/serviceAuth';
import Layout from '../components/commun/Layout';
import AuthVisual from '../components/auth/AuthVisual';

const Connexion = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnexion = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const responseData = await login(email, motDePasse);
      const { role, id } = responseData;

      const cleanedRole = role.replace('ROLE_', '');
      const roleToStore = cleanedRole === 'USER' ? 'UTILISATEUR' : cleanedRole;

      localStorage.setItem('role', roleToStore);
      localStorage.setItem('userId', id);

      window.dispatchEvent(new Event('storage'));

      setMessage('Connexion réussie ! Redirection en cours...');

      switch (cleanedRole) {
        case 'ADMIN':
          navigate('/tableauAdmin');
          break;
        case 'PSYCHIATRE':
        case 'PSYCHOLOGUE':
        case 'USER':
          navigate('/');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Connexion échouée. Veuillez vérifier votre email/mot de passe.';

      setMessage('Erreur : ' + errorMessage);
      console.error('Erreur de connexion:', error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="pc-body flex min-h-screen bg-[#F8FAFC]">
        <AuthVisual
          title="Bienvenue sur PsyConnect"
          subtitle="Prenez soin de votre bien-être mental grâce à une plateforme sécurisée, confidentielle et accessible partout."
        />

        {/* RIGHT SIDE */}
        <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-16">
          <div className="pc-card w-full max-w-[420px] bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(37,99,235,0.18)] p-10">

            <div className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="pc-display text-lg font-bold text-slate-900">PsyConnect</span>
            </div>

            <h2 className="pc-display text-[1.75rem] font-bold text-slate-900 mb-1">Connexion</h2>
            <p className="text-slate-500 text-sm mb-8">Heureux de vous revoir.</p>

            <form onSubmit={handleConnexion} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@domaine.com"
                    className="pc-input w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Mot de passe</label>
                  <Link
                    to="/mot-de-passe-oublie"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="pc-input w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="pc-btn w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  'Connexion...'
                ) : (
                  <>
                    Se connecter <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* MESSAGE */}
              {message && (
                <p
                  className={`text-center text-sm rounded-xl py-2 px-3 ${
                    message.includes('réussie')
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-500'
                  }`}
                >
                  {message}
                </p>
              )}
            </form>

            {/* SIGNUP */}
            <p className="text-center text-sm text-slate-500 mt-8">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="text-blue-600 font-semibold hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .pc-btn {
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          box-shadow: 0 10px 25px -8px rgba(37,99,235,0.55);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pc-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px -8px rgba(37,99,235,0.65);
        }
        .pc-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -60%;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .pc-btn:hover::after { left: 130%; }
        .pc-card { animation: pc-card-in 0.6s ease both; }
        @keyframes pc-card-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pc-card { animation: none; }
          .pc-btn:hover:not(:disabled) { transform: none; }
        }
      `}</style>
    </Layout>
  );
};

export default Connexion;