// src/pages/Connexion.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/serviceAuth';
import Layout from '../components/commun/Layout';

const Connexion = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const [offsets, setOffsets] = useState({
    circle1: { x: 0, y: 0 },
    circle2: { x: 0, y: 0 },
    circle3: { x: 0, y: 0 }
  });

  useEffect(() => {
    let frame;
    const animate = () => {
      const time = Date.now() / 1000;
      setOffsets({
        circle1: { x: 15 * Math.sin(time), y: 10 * Math.cos(time / 1.5) },
        circle2: { x: 20 * Math.cos(time / 1.2), y: 15 * Math.sin(time / 2) },
        circle3: { x: 10 * Math.sin(time / 1.8), y: 12 * Math.cos(time / 1.3) },
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleConnexion = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const responseData = await login(email, motDePasse);
      const { role, id } = responseData;

      const cleanedRole = role.replace('ROLE_', '');
      const roleToStore = cleanedRole === 'USER' ? 'UTILISATEUR' : cleanedRole;

      localStorage.setItem('role', roleToStore);
      localStorage.setItem('userId', id);

      window.dispatchEvent(new Event("storage"));

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
        "Connexion échouée. Veuillez vérifier votre email/mot de passe.";

      setMessage("Erreur : " + errorMessage);
      console.error("Erreur de connexion:", error.response || error.message);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50">

        {/* LEFT SIDE */}
        <div className="hidden md:flex w-1/2 items-center justify-center rounded-l-3xl overflow-hidden relative bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-300">
          <svg className="absolute w-full h-full" viewBox="0 0 800 600">
            <circle cx={200 + offsets.circle1.x} cy={200 + offsets.circle1.y} r="120" fill="#93c5fd" />
            <circle cx={600 + offsets.circle2.x} cy={400 + offsets.circle2.y} r="150" fill="#60a5fa" />
            <circle cx={400 + offsets.circle3.x} cy={300 + offsets.circle3.y} r="180" fill="#3b82f6" />
          </svg>

          <div className="relative z-10 text-center p-10 max-w-md">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Bienvenue sur PsyConnect
            </h1>
            <p className="text-gray-700 text-lg">
              Suivez votre bien-être mental et accédez à vos fonctionnalités facilement.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-10">

          <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-10">

            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Connexion
            </h2>

            <form onSubmit={handleConnexion} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <i className="fas fa-user"></i>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="exemple@domaine.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    required
                    value={motDePasse}
                    onChange={e => setMotDePasse(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                  />
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition transform hover:scale-105"
              >
                Se connecter
              </button>

              {/* MESSAGE */}
              {message && (
                <p className={`text-center mt-2 text-sm ${message.includes("réussie") ? 'text-green-600' : 'text-red-500'}`}>
                  {message}
                </p>
              )}

            </form>

            {/* SIGNUP */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Pas encore de compte ?
              <Link to="/inscription" className="ml-1 text-blue-600 font-semibold hover:underline">
                Créer un compte
              </Link>
            </p>

          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Connexion;