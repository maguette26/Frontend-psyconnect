import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Search,
  PlayCircle,
  Headphones,
  Quote,
  BookOpen,
  FileText,
  Eye,
  Download,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/commun/Layout';
import { useRessource } from './RessourceContext.jsx';

// Petite table de correspondance type -> icône / label / couleur du badge.
// Purement visuel : n'affecte ni les données ni la logique.
const TYPE_META = {
  video: { label: 'Vidéo', icon: PlayCircle, badgeClass: 'bg-rose-50 text-rose-600' },
  podcast: { label: 'Podcast', icon: Headphones, badgeClass: 'bg-orange-50 text-orange-600' },
  citation: { label: 'Citation', icon: Quote, badgeClass: 'bg-violet-50 text-violet-600' },
  guide: { label: 'Guide', icon: BookOpen, badgeClass: 'bg-emerald-50 text-emerald-600' },
  article: { label: 'Article', icon: FileText, badgeClass: 'bg-blue-50 text-blue-600' },
};

const getTypeMeta = (type) =>
  TYPE_META[(type || '').toLowerCase()] || {
    label: type || 'Ressource',
    icon: FileText,
    badgeClass: 'bg-gray-100 text-gray-600',
  };

const Ressources = () => {
  const navigate = useNavigate();
  const { selectedCategory, setSelectedCategory, categoriesOrder } = useRessource();
const [userReady, setUserReady] = useState(false);
  const [fonctionnalites, setFonctionnalites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [notConnectedMessage, setNotConnectedMessage] = useState('');
  // Recherche discrète — n'affecte que l'affichage, aucune logique métier.
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFonctionnalites = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await api.get('/fonctionnalites');
    console.log('RAW DATA:', res.data);
    console.log('Types statut:', res.data?.map(f => ({ 
      nom: f.nom, 
      statut: f.statut, 
      typeStatut: typeof f.statut 
    })));
    
    if (Array.isArray(res.data)) {
      const ressourcesFiltrees = res.data
        .filter(f => f.statut === true || f.statut === 'true' || f.statut === 1)  // ← fix
        .map(f => ({
          ...f,
          premium: f.type === 'podcast' ? true : f.premium
        }));
      console.log('Après filtre:', ressourcesFiltrees.length, 'ressources');
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
 
 // 1. Sync role depuis localStorage (refresh instant UI)
useEffect(() => {
  const syncUser = () => {
    const role = localStorage.getItem("role");

    setIsUserPremium(role === "PREMIUM" || role === "ADMIN");
    setUserReady(true);
  };

  syncUser();

  window.addEventListener("roleChange", syncUser);

  return () => window.removeEventListener("roleChange", syncUser);
}, []);

// 2. Load user + data
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    setNotConnectedMessage("⚠️ Vous devez être connecté");
    navigate("/connexion");
    return;
  }

  const fetchUserInfo = async () => {
    try {
      const res = await api.get("/auth/me");

      const role = res.data.role;

      setIsUserPremium(role === "PREMIUM" || role === "ADMIN");

      localStorage.setItem("role", role);

      // 🔥 IMPORTANT: notify UI partout
      window.dispatchEvent(new Event("user-updated"));

    } catch {
      setIsUserPremium(false);
    } finally {
      fetchFonctionnalites();
    }
  };

  fetchUserInfo();
}, [navigate, fetchFonctionnalites]);

  const filteredFonctionnalites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return fonctionnalites.filter(f => {
      const matchesCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'Autres' && !categoriesOrder.some(cat => cat.key === f.type)) ||
        f.type === selectedCategory;
      const matchesSearch = !q || (f.nom || '').toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [fonctionnalites, selectedCategory, categoriesOrder, searchQuery]);

  if (notConnectedMessage) {
    return (
      <Layout>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md mx-auto mt-20 p-8 bg-red-50 border border-red-300 rounded-lg shadow-lg flex flex-col items-center gap-4 select-none"
        >
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-red-700 text-center">
            ⚠️ Vous devez être connecté pour accéder aux ressources.
          </h2>
          <p className="text-red-600 text-center">Vous allez être redirigé vers la page de connexion...</p>
        </motion.div>
      </Layout>
    );
  }

  const gratuits = filteredFonctionnalites.filter(f => !f.premium);
  const premiums = filteredFonctionnalites.filter(f => f.premium);
  const totalCount = filteredFonctionnalites.length;

  const resourceLinks = {
    "mini defi gratuite": "/mini-defi-gratuite",
    "liste de controle bien etre": "/liste-controle-bien-etre",
    "mini challenge decouverte": "/mini-defi-decouverte",
    "guide fixer des limites saines": "/guide-fixateur-limites",
    "auto evaluation basique": "/auto-evaluation-basique",
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
      // Ressource premium + utilisateur non premium : message + bouton
      return (
        <div className="mt-3 text-gray-600 text-sm">
          🔐 Cette ressource est réservée aux membres Premium.
          <button
            onClick={() => navigate('/devenir-premium')}
            className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 active:scale-[0.97] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
          >
            Devenir Premium
          </button>
        </div>
      );
    }

    if (resourceLinks[normalizedNom]) {
      return (
        <Link
          to={resourceLinks[normalizedNom]}
          className="inline-flex items-center gap-2 mt-3 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 rounded"
          onClick={(e) => {
            if (premium && !isUserPremium) {
              e.preventDefault();
              navigate('/devenir-premium');
            }
          }}
        >
          <Eye className="w-4 h-4" /> Accéder à la ressource
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
            ? <a
                href={lienFichier}
                className="inline-flex items-center gap-1 mt-3 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 rounded"
                target="_blank"
                rel="noopener noreferrer"
                onClick={premium ? (e) => { e.preventDefault(); navigate('/devenir-premium'); } : undefined}
              >
                <PlayCircle className="w-4 h-4" /> Voir la vidéo
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
              className="inline-flex items-center gap-1 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 rounded"
              onClick={premium ? (e) => { e.preventDefault(); navigate('/devenir-premium'); } : undefined}
            >
              <Headphones className="w-4 h-4" /> Écouter le podcast
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
                className="inline-flex items-center gap-1 mt-2 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 rounded"
                onClick={premium ? (e) => { e.preventDefault(); navigate('/devenir-premium'); } : undefined}
              >
                <Download className="w-4 h-4" /> Consulter
              </a>
            )}
          </div>
        );
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.03, boxShadow: "0 12px 28px rgba(99, 102, 241, 0.18)" }
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

  // Helper to get the link (route or file) for a resource (if free)
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

        {/* Barre de recherche discrète, alignée sur le style existant */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une ressource..."
              aria-label="Rechercher une ressource"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 rounded-full text-gray-700 placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categoriesOrder.map(({ key, title }) => (
            <motion.button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1
                ${selectedCategory === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.97 }}
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
            {/* Petit compteur discret au-dessus des ressources */}
            <p className="text-center text-sm text-gray-500 mb-8 select-none">
              {totalCount} ressource{totalCount !== 1 ? 's' : ''}
              {gratuits.length > 0 && premiums.length > 0 && (
                <> &nbsp;•&nbsp; {gratuits.length} gratuite{gratuits.length !== 1 ? 's' : ''} &nbsp;•&nbsp; {premiums.length} Premium</>
              )}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {gratuits.length > 0 && (
                  <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6 border-b border-gray-300 pb-2 flex items-center gap-2 select-none">
                      ✨ Ressources Gratuites
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {gratuits.map(f => {
                        const url = getRessourceUrl(f);
                        const meta = getTypeMeta(f.type);
                        const TypeIcon = meta.icon;
                        return (
                          <motion.div
                            key={f.id}
                            className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between cursor-pointer transition-shadow duration-300`}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            whileTap={{ scale: 0.99 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
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
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                  Gratuit
                                </span>
                                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                                  <TypeIcon className="w-3 h-3" /> {meta.label}
                                </span>
                              </div>
                              <h3 className="font-semibold text-lg mb-2 text-gray-900 leading-snug">{f.nom}</h3>
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
                      {premiums.map(f => {
                        const meta = getTypeMeta(f.type);
                        const TypeIcon = meta.icon;
                        return (
                          <motion.div
                            key={f.id}
                            className="relative overflow-hidden bg-yellow-50 rounded-xl shadow-md border border-yellow-300 p-6 cursor-pointer flex flex-col justify-between transition-shadow duration-300"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            whileTap={{ scale: 0.99 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            onClick={() => navigate('/devenir-premium')}
                            title="Cette ressource nécessite un abonnement Premium"
                          >
                            {/* Léger effet de brillance, très discret */}
                            <div className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/40 blur-2xl" />

                            <div className="flex justify-between items-center mb-3 relative">
                              <h3 className="font-semibold text-lg text-yellow-900 leading-snug">{f.nom}</h3>
                              <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full select-none">
                                🔒 Premium
                              </span>
                            </div>
                            <div className="mb-1 relative">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                                <TypeIcon className="w-3 h-3" /> {meta.label}
                              </span>
                            </div>
                            <div className="relative">{renderResourceContent(f)}</div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Ressources;