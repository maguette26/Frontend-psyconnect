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
  Heart,
  Share2,
  Lock,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/commun/Layout';
import { useRessource } from './RessourceContext.jsx';

const TYPE_META = {
  video: { label: 'Vidéo', icon: PlayCircle, badgeClass: 'bg-rose-50 text-rose-600' },
  podcast: { label: 'Podcast', icon: Headphones, badgeClass: 'bg-orange-50 text-orange-600' },
  citation: { label: 'Citation', icon: Quote, badgeClass: 'bg-violet-50 text-violet-600' },
  guide: { label: 'Guide', icon: BookOpen, badgeClass: 'bg-emerald-50 text-emerald-600' },
  guide_pratique: { label: 'Guide pratique', icon: BookOpen, badgeClass: 'bg-emerald-50 text-emerald-600' },
  article: { label: 'Article', icon: FileText, badgeClass: 'bg-blue-50 text-blue-600' },
};

const getTypeMeta = (type) =>
  TYPE_META[(type || '').toLowerCase()] || {
    label: type || 'Ressource',
    icon: FileText,
    badgeClass: 'bg-gray-100 text-gray-600',
  };

/* ─────────────────── ÉCRAN "CONNEXION REQUISE" (nouveau) ───────────────────
   Remplace l'ancienne redirection immédiate vers /connexion.
   - Fade + léger slide à l'apparition (Framer Motion)
   - Countdown de 5s affiché et décrémenté chaque seconde
   - navigate("/connexion") n'est appelé QUE au clic "Se connecter"
     ou quand le countdown atteint 0 (géré par le composant parent)
*/
const AuthRequiredScreen = ({ countdown, onLogin, onRegister }) => (
  <motion.div
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="max-w-md mx-auto mt-16 sm:mt-24 p-6 sm:p-8 bg-white border border-indigo-100 rounded-2xl shadow-lg flex flex-col items-center gap-4 text-center mx-4"
  >
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
      <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
    </div>

    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
      Connexion requise
    </h2>

    <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
      Pour accéder à votre bibliothèque de ressources (guides, vidéos, podcasts et exercices),
      vous devez être connecté à votre compte.
    </p>

    <div className="flex flex-col xs:flex-row gap-3 w-full mt-2">
      <button
        onClick={onLogin}
        className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold rounded-xl px-5 py-2.5 sm:py-3 hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
      >
        <LogIn className="w-4 h-4 shrink-0" />
        Se connecter
      </button>
      <button
        onClick={onRegister}
        className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold rounded-xl px-5 py-2.5 sm:py-3 hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
      >
        <UserPlus className="w-4 h-4 shrink-0" />
        Créer un compte
      </button>
    </div>

    <p className="text-gray-400 text-xs sm:text-sm mt-1">
      Redirection dans {countdown} seconde{countdown > 1 ? 's' : ''}...
    </p>
  </motion.div>
);

const Ressources = () => {
  const navigate = useNavigate();
  const { selectedCategory, setSelectedCategory, categoriesOrder } = useRessource();
  const [userReady, setUserReady] = useState(false);
  const [fonctionnalites, setFonctionnalites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserPremium, setIsUserPremium] = useState(false);
  // Remplace l'ancien notConnectedMessage : ne déclenche plus de redirection immédiate,
  // affiche à la place l'écran "Connexion requise" avec countdown.
  const [authRequired, setAuthRequired] = useState(false);
  const [countdown, setCountdown] = useState(5);
  // Recherche discrète — n'affecte que l'affichage, aucune logique métier.
  const [searchQuery, setSearchQuery] = useState('');
  // Favoris + partage — état purement local/visuel, n'affecte aucune logique métier.
  const [favorites, setFavorites] = useState(() => new Set());
  const [toast, setToast] = useState('');

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

  // 1. Sync role depuis localStorage (refresh instant UI)
  useEffect(() => {
    const syncUser = () => {
      const role = localStorage.getItem("role");
      setIsUserPremium(role === "PREMIUM" || role === "ADMIN");
      setUserReady(true);
    };

    syncUser();

    window.addEventListener("roleChange", syncUser);
    window.addEventListener("user-updated", syncUser);

    return () => {
      window.removeEventListener("roleChange", syncUser);
      window.removeEventListener("user-updated", syncUser);
    };
  }, []);

  // 2. Load user + data
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // ⚠️ Plus de navigate() immédiat ici : on affiche l'écran d'information,
      // la redirection réelle est gérée par le useEffect de countdown ci-dessous
      // ou par le clic sur "Se connecter".
      setAuthRequired(true);
      setUserReady(true);
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
        setUserReady(true);
        fetchFonctionnalites();
      }
    };

    fetchUserInfo();
  }, [navigate, fetchFonctionnalites]);

  // 3. Countdown de redirection (5s) — ne se déclenche que si authRequired === true.
  // setInterval (affichage) + setTimeout (redirection réelle) sont tous les deux
  // nettoyés proprement au démontage ou si authRequired repasse à false.
  useEffect(() => {
    if (!authRequired) return;

    setCountdown(5);

    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      navigate("/connexion");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [authRequired, navigate]);

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

  if (authRequired) {
    return (
      <Layout>
        <AnimatePresence mode="wait">
          <AuthRequiredScreen
            key="auth-required"
            countdown={countdown}
            onLogin={() => navigate("/connexion")}
            onRegister={() => navigate("/inscription")}
          />
        </AnimatePresence>
      </Layout>
    );
  }

  const gratuits = filteredFonctionnalites.filter(f => !f.premium);
  const premiums = filteredFonctionnalites.filter(f => f.premium);

  const resourceLinks = {
    "mini defi gratuite": "/mini-defi-gratuite",
    "liste de controle bien etre": "/liste-controle-bien-etre",
    "mini challenge decouverte": "/mini-defi-decouverte",
    "guide fixer des limites saines": "/guide-fixateur-limites",
    "auto evaluation basique": "/auto-evaluation-basique",
  };

  // Détecte si un lien pointe vers un PDF, pour l'ouvrir "dans l'appli" (nouvel onglet interne au domaine).
  const isPdfLink = (url) => !!url && url.toLowerCase().split('?')[0].endsWith('.pdf');

  // Utilisateur autorisé à voir une ressource premium : PREMIUM ou ADMIN.
  // userReady évite d'afficher le cadenas pendant la fraction de seconde où
  // isUserPremium est encore à sa valeur initiale (false) avant résolution de /auth/me.
  const canAccessPremium = (f) => !f.premium || !userReady || isUserPremium;

  const renderResourceContent = (f) => {
    const { type, description, lienFichier, premium, nom } = f;

    const normalizedNom = nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Tant qu'on ne sait pas encore qui est l'utilisateur, on n'affiche rien
    // de définitif pour éviter un flash "réservé aux membres Premium".
    if (!userReady) {
      return null;
    }

    // Seul cas où on bloque réellement : ressource premium ET utilisateur non premium.
    if (premium && !isUserPremium) {
      return (
        <div className="mt-3 text-gray-600 text-sm flex flex-wrap items-center gap-2">
          <span>🔐 Cette ressource est réservée aux membres Premium.</span>
          <button
            onClick={() => navigate('/devenir-premium')}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 active:scale-[0.97] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 shrink-0"
          >
            Devenir Premium
          </button>
        </div>
      );
    }

    // À partir d'ici : soit la ressource est gratuite, soit l'utilisateur a bien
    // le droit d'y accéder (Premium/Admin). Plus aucun lien ci-dessous ne doit
    // renvoyer vers /devenir-premium.

    if (resourceLinks[normalizedNom]) {
      return (
        <Link
          to={resourceLinks[normalizedNom]}
          className="inline-flex items-center gap-2 mt-3 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="w-4 h-4 shrink-0" /> Accéder à la ressource
        </Link>
      );
    }

    switch (type.toLowerCase()) {
      case 'citation':
        return (
          <blockquote className="mt-3 italic text-gray-700 border-l-2 border-indigo-300 pl-3 break-words">
            💬 "{description}"
          </blockquote>
        );

      case 'video': {
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
        // Vidéo non-YouTube avec un lien : on tente une lecture directe en <video>,
        // et on ne quitte le site que si c'est vraiment nécessaire (fallback).
        if (lienFichier) {
          return (
            <div className="mt-3 flex flex-col gap-2">
              <video controls className="w-full rounded-md shadow-sm">
                <source src={lienFichier} />
                Votre navigateur ne supporte pas la lecture vidéo intégrée.
              </video>
              <a
                href={lienFichier}
                className="inline-flex items-center gap-1 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 rounded"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <PlayCircle className="w-4 h-4 shrink-0" /> Voir la vidéo
              </a>
            </div>
          );
        }
        return <p className="mt-3 text-gray-800 break-words">{description}</p>;
      }

      case 'podcast': {
        const isYoutubePodcast = lienFichier && (lienFichier.includes('youtube.com') || lienFichier.includes('youtu.be'));
        if (isYoutubePodcast) {
          const youtubeId = lienFichier.split('v=')[1]?.split('&')[0] || lienFichier.split('/').pop();
          return (
            <div className="mt-3 flex flex-col gap-2">
              <div className="aspect-w-16 aspect-h-9 rounded overflow-hidden shadow-sm">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  allowFullScreen
                  title={nom}
                />
              </div>
            </div>
          );
        }
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
              onClick={(e) => e.stopPropagation()}
            >
              <Headphones className="w-4 h-4 shrink-0" /> Écouter le podcast
            </a>
          </div>
        );
      }

      case 'guide':
      case 'guide_pratique':
        // PDF/Guide : lecture intégrée dans la page (iframe), on ne quitte le site
        // que si le navigateur ne peut vraiment pas l'afficher en interne.
        return (
          <div className="mt-3 text-gray-800">
            <p className="break-words">{description}</p>
            {lienFichier && (
              isPdfLink(lienFichier) ? (
                <div className="mt-2 rounded overflow-hidden shadow-sm border border-gray-200">
                  <iframe
                    src={lienFichier}
                    className="w-full h-[500px]"
                    title={nom}
                  />
                </div>
              ) : (
                <a
                  href={lienFichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4 shrink-0" /> Consulter le guide
                </a>
              )
            )}
          </div>
        );

      default:
        return (
          <div className="mt-3 text-gray-800">
            <p className="break-words">{description}</p>
            {lienFichier && (
              isPdfLink(lienFichier) ? (
                <div className="mt-2 rounded overflow-hidden shadow-sm border border-gray-200">
                  <iframe
                    src={lienFichier}
                    className="w-full h-[500px]"
                    title={nom}
                  />
                </div>
              ) : (
                <a
                  href={lienFichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-indigo-600 font-semibold no-underline hover:text-indigo-800 hover:no-underline transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4 shrink-0" /> Consulter
                </a>
              )
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
    guide: '📘',
    guide_pratique: '📘',
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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = async (e, f) => {
    e.stopPropagation();
    const url = getRessourceUrl(f);
    const shareUrl = url && !url.startsWith('/') ? url : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: f.nom, text: f.description, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Lien copié.');
      }
    } catch {
      // partage annulé par l'utilisateur : rien à faire
    }
  };

  // Clic sur une carte Premium : accès direct pour Premium/Admin, redirection sinon.
  const handlePremiumCardClick = (f) => {
    if (!userReady) return;
    if (!isUserPremium) {
      navigate('/devenir-premium');
      return;
    }
    const url = getRessourceUrl(f);
    if (url) {
      if (url.startsWith('/')) {
        navigate(url);
      } else {
        window.open(url, '_blank', 'noopener noreferrer');
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 overflow-x-hidden">
        <motion.h1
          className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 text-center select-none"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          📚 Bibliothèque de Ressources
        </motion.h1>

        {/* Catégories : largeur homogène, centrées, grille sur mobile pour éviter le scroll horizontal */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3 justify-center mb-6 sm:mb-8 px-1">
          {categoriesOrder.map(({ key, title }) => (
            <motion.button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 sm:px-5 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 text-center truncate
                ${selectedCategory === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={selectedCategory === key}
            >
              {emojiByCategory[key.toLowerCase()] || '📁'} {title}
            </motion.button>
          ))}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6 break-words">
            {error}
          </div>
        )}

        {!loading && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {gratuits.length > 0 && (
                  <section className="mb-10 sm:mb-16">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 border-b border-gray-300 pb-2 flex items-center gap-2 select-none">
                      ✨ Ressources Gratuites
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {gratuits.map(f => {
                        const url = getRessourceUrl(f);
                        const meta = getTypeMeta(f.type);
                        const TypeIcon = meta.icon;
                        return (
                          <motion.div
                            key={f.id}
                            className={`bg-white rounded-xl shadow-md border border-gray-200 p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-shadow duration-300`}
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
                              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
                                    Gratuit
                                  </span>
                                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${meta.badgeClass}`}>
                                    <TypeIcon className="w-3 h-3 shrink-0" /> {meta.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    aria-label={favorites.has(f.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                    onClick={(e) => toggleFavorite(e, f.id)}
                                    className="p-1.5 rounded-full transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                                  >
                                    <Heart className={`w-4 h-4 transition-colors ${favorites.has(f.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label="Partager cette ressource"
                                    onClick={(e) => handleShare(e, f)}
                                    className="p-1.5 rounded-full transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                                  >
                                    <Share2 className="w-4 h-4 text-gray-400" />
                                  </button>
                                </div>
                              </div>
                              <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 leading-snug break-words">{f.nom}</h3>
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
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 border-b border-yellow-400 pb-2 text-yellow-700 flex items-center gap-2 select-none">
                      ⭐ Ressources Premium
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {premiums.map(f => {
                        const meta = getTypeMeta(f.type);
                        const TypeIcon = meta.icon;
                        const unlocked = canAccessPremium(f);
                        return (
                          <motion.div
                            key={f.id}
                            className={`relative overflow-hidden rounded-xl shadow-md border p-5 sm:p-6 cursor-pointer flex flex-col justify-between transition-shadow duration-300 ${
                              unlocked
                                ? 'bg-white border-gray-200'
                                : 'bg-yellow-50 border-yellow-300'
                            }`}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            whileTap={{ scale: 0.99 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            onClick={() => handlePremiumCardClick(f)}
                            title={unlocked ? undefined : "Cette ressource nécessite un abonnement Premium"}
                          >
                            <div className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/40 blur-2xl" />

                            <div className="flex justify-between items-start gap-2 mb-3 relative flex-wrap">
                              <h3 className={`font-semibold text-base sm:text-lg leading-snug break-words flex-1 min-w-0 ${unlocked ? 'text-gray-900' : 'text-yellow-900'}`}>{f.nom}</h3>
                              <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                                <button
                                  type="button"
                                  aria-label={favorites.has(f.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                  onClick={(e) => toggleFavorite(e, f.id)}
                                  className="p-1.5 rounded-full transition-colors duration-200 hover:bg-yellow-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                                >
                                  <Heart className={`w-4 h-4 transition-colors ${favorites.has(f.id) ? 'fill-red-500 text-red-500' : 'text-yellow-700/60'}`} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Partager cette ressource"
                                  onClick={(e) => handleShare(e, f)}
                                  className="p-1.5 rounded-full transition-colors duration-200 hover:bg-yellow-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                                >
                                  <Share2 className="w-4 h-4 text-yellow-700/60" />
                                </button>
                                <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full select-none whitespace-nowrap">
                                  {unlocked ? '⭐ Premium' : '🔒 Premium'}
                                </span>
                              </div>
                            </div>
                            <div className="mb-1 relative">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                                <TypeIcon className="w-3 h-3 shrink-0" /> {meta.label}
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

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 max-w-[90vw] text-center"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Ressources;