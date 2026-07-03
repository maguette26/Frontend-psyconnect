import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/commun/Layout';
import AuthRequiredModal from '../components/commun/AuthRequiredModal';
import { useRessource } from './RessourceContext.jsx';

const Ressources = () => {
  const navigate = useNavigate();
  const { selectedCategory, setSelectedCategory, categoriesOrder } = useRessource();
  const [fonctionnalites, setFonctionnalites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fetchFonctionnalites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/fonctionnalites');
      if (Array.isArray(res.data)) {
        const ressourcesFiltrees = res.data
          .filter(f => f.statut === true || f.statut === 'true' || f.statut === 1)
          .map(f => ({
            ...f,
            premium: f.type === 'podcast' ? true : f.premium
          }));
        setFonctionnalites(ressourcesFiltrees);
      } else {
        throw new Error("Format de données invalide.");
      }
    } catch (err) {
      console.error('Erreur fetch:', err);
      setError("Erreur de chargement des fonctionnalités.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync rôle depuis localStorage (refresh instant UI, sans jamais rediriger un invité)
  useEffect(() => {
    const syncUser = () => {
      const role = localStorage.getItem("role");
      setIsUserPremium(role === "PREMIUM" || role === "ADMIN");
    };
    syncUser();
    window.addEventListener("roleChange", syncUser);
    return () => window.removeEventListener("roleChange", syncUser);
  }, []);

  // Chargement : /fonctionnalites nécessite une connexion, donc on ne l'appelle
  // que si un token est présent. Les invités voient directement le mur de connexion.
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    if (!token) {
      setIsUserPremium(false);
      setFonctionnalites([]);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const res = await api.get("/auth/me");
        const role = res.data.role;
        setIsUserPremium(role === "PREMIUM" || role === "ADMIN");
        localStorage.setItem("role", role);
        window.dispatchEvent(new Event("user-updated"));
      } catch {
        setIsUserPremium(false);
      } finally {
        fetchFonctionnalites();
      }
    };

    fetchUserInfo();
  }, [fetchFonctionnalites]);

  const filteredFonctionnalites = useMemo(() => {
    return fonctionnalites.filter(f =>
      selectedCategory === 'all' ||
      (selectedCategory === 'Autres' && !categoriesOrder.some(cat => cat.key === f.type)) ||
      f.type === selectedCategory
    );
  }, [fonctionnalites, selectedCategory, categoriesOrder]);

  const gratuits = filteredFonctionnalites.filter(f => !f.premium);
  const premiums = filteredFonctionnalites.filter(f => f.premium);

  const resourceLinks = {
    "mini defi gratuite": "/mini-defi-gratuite",
    "liste de controle bien etre": "/liste-controle-bien-etre",
    "mini challenge decouverte": "/mini-defi-decouverte",
    "guide fixer des limites saines": "/guide-fixateur-limites",
    "auto evaluation basique": "/auto-evaluation-basique",
  };

  // Point d'entrée unique pour tout clic sur du contenu premium
  const handlePremiumClick = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      navigate('/devenir-premium');
    }
  };

  const renderResourceContent = (f) => {
    const { type, description, lienFichier, premium, nom } = f;

    const normalizedNom = nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (premium && !isUserPremium) {
      return (
        <div className="mt-3 text-gray-600 text-sm">
          🔐 {isAuthenticated
            ? "Cette ressource est réservée aux membres Premium."
            : "Cette ressource est réservée aux membres connectés."}
          <button
            onClick={handlePremiumClick}
            className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition"
          >
            {isAuthenticated ? "Devenir Premium" : "Se connecter"}
          </button>
        </div>
      );
    }

    if (resourceLinks[normalizedNom]) {
      return (
        <Link
          to={resourceLinks[normalizedNom]}
          className="inline-flex items-center gap-2 mt-3 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline"
          onClick={(e) => {
            if (premium && !isUserPremium) {
              e.preventDefault();
              handlePremiumClick();
            }
          }}
        >
          <span>▶️</span> Accéder à la ressource
        </Link>
      );
    }

    switch (type.toLowerCase()) {
      case 'citation':
        return (
          <blockquote className="mt-3 italic text-gray-700 border-l-2 border-indigo-300 pl-3">
            💬 "{description}"
          </blockquote>
        );

      case 'video':
        if (lienFichier && (lienFichier.includes('youtube.com') || lienFichier.includes('youtu.be'))) {
          const youtubeId = lienFichier.split('v=')[1]?.split('&')[0] || lienFichier.split('/').pop();
          return (
            <div className="mt-3 aspect-w-16 aspect-h-9 rounded overflow-hidden shadow-sm">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                allowFullScreen
                title={nom}
              />
            </div>
          );
        }
        return (
          lienFichier
            ? 
<a
                href={lienFichier}
                className="inline-flex items-center gap-1 mt-3 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
                onClick={premium ? (e) => { e.preventDefault(); handlePremiumClick(); } : undefined}
              >
                ▶️ Voir la vidéo
              </a>
            : <p className="mt-3 text-gray-800">{description}</p>
        );

      case 'podcast':
        return (
          <div className="mt-3 flex flex-col gap-2">
            <audio controls className="w-full rounded-md shadow-sm">
              <source src={lienFichier} type="audio/mpeg" />
            </audio>
            <a
              href={lienFichier}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline"
              onClick={premium ? (e) => { e.preventDefault(); navigate('/devenir-premium'); } : undefined}
            >
              🎧 Écouter le podcast
            </a>
          </div>
        );

      default:
        return (
          <div className="mt-3 text-gray-800">
            <p>{description}</p>
            {lienFichier && (
              <a
                href={lienFichier}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline"
                onClick={premium ? (e) => { e.preventDefault(); handlePremiumClick(); } : undefined}
              >
                📄 Consulter
              </a>
            )}
          </div>
        );
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.03, boxShadow: "0 8px 20px rgba(99, 102, 241, 0.15)" }
  };

  const emojiByCategory = {
    all: '📚',
    citation: '💬',
    video: '🎥',
    podcast: '🎧',
    article: '📝',
    livre: '📖',
    autres: '🔖',
  };

  const getRessourceUrl = (f) => {
    const normalizedNom = f.nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (resourceLinks[normalizedNom]) {
      return resourceLinks[normalizedNom];
    }
    return f.lienFichier || null;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.h1
          className="text-3xl font-bold mb-8 text-gray-900 text-center select-none"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          📚 Bibliothèque de Ressources
        </motion.h1>

        {!isAuthenticated ? (
          // Mur de connexion pour les invités — /fonctionnalites nécessite une session active
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto text-center bg-blue-50 border border-blue-100 rounded-2xl px-6 py-10"
          >
            <div className="text-4xl mb-3 select-none">🔒</div>
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Connexion requise
            </h2>
            <p className="text-sm text-blue-700 mb-6">
              La bibliothèque de ressources est réservée aux membres connectés.
              Connectez-vous ou créez un compte gratuitement pour y accéder.
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition"
            >
              Se connecter
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {categoriesOrder.map(({ key, title }) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-5 py-2 rounded-full font-medium transition-colors duration-300
                    ${selectedCategory === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={selectedCategory === key}
                >
                  {emojiByCategory[key.toLowerCase()] || '📁'} {title}
                </motion.button>
              ))}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
                {error}
              </div>
            )}

            {!loading && (
              <>
                {gratuits.length > 0 && (
                  <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 border-b border-gray-300 pb-2 flex items-center gap-2 select-none">
                      ✨ Ressources Gratuites
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {gratuits.map(f => {
                        const url = getRessourceUrl(f);
                        return (
                          <motion.div
                            key={f.id}
                            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between cursor-pointer`}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            transition={{ duration: 0.3 }}
                            onClick={() => {
                              if (url) {
                                if (url.startsWith('/')) {
                                  navigate(url);
                                } else {
                                  window.open(url, '_blank', 'noopener noreferrer');
                                }
                              }
                            }}
                          >
                            <div>
                              <h3 className="font-semibold text-lg mb-2 text-gray-900">{f.nom}</h3>
                              {renderResourceContent(f)}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {premiums.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-6 border-b border-yellow-400 pb-2 text-yellow-700 flex items-center gap-2 select-none">
                      ⭐ Ressources Premium
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {premiums.map(f => (
                        <motion.div
                          key={f.id}
                          className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-300 p-6 cursor-pointer flex flex-col justify-between"
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                          transition={{ duration: 0.3 }}
                          onClick={handlePremiumClick}
                          title={isAuthenticated ? "Cette ressource nécessite un abonnement Premium" : "Connectez-vous pour accéder à cette ressource"}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-lg text-yellow-900">{f.nom}</h3>
                            <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full select-none">
                              🔒 Premium
                            </span>
                          </div>
                          <div>{renderResourceContent(f)}</div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>

      <AuthRequiredModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Accès réservé"
        message="Cette ressource est réservée aux membres connectés. Connectez-vous ou créez un compte gratuitement pour accéder à toutes les ressources."
      />
    </Layout>
  );
};

export default Ressources;