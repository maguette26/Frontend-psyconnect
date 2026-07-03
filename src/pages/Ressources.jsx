import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Library,
  Search,
  Heart,
  Share2,
  X,
  Crown,
  PlayCircle,
  Headphones,
  Quote,
  BookOpen,
  FileText,
  Clock,
  Lock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/commun/Layout';
import { useRessource } from './RessourceContext.jsx';

/* ============================================================
   Static config — purely visual, no business logic
   ============================================================ */

const TYPE_CONFIG = {
  video: { label: 'Vidéo', icon: PlayCircle, badge: 'bg-rose-100 text-rose-700', dot: 'bg-rose-400' },
  podcast: { label: 'Podcast', icon: Headphones, badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  citation: { label: 'Citation', icon: Quote, badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-400' },
  guide: { label: 'Guide', icon: BookOpen, badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  article: { label: 'Article', icon: FileText, badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
};

const getTypeConfig = (type) =>
  TYPE_CONFIG[(type || '').toLowerCase()] || {
    label: type || 'Ressource',
    icon: FileText,
    badge: 'bg-gray-100 text-gray-700',
    dot: 'bg-gray-400',
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

/* ============================================================
   Small presentational helpers
   ============================================================ */

const AccessBadge = ({ premium }) =>
  premium ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-2.5 py-1 text-[11px] font-semibold text-yellow-900 shadow-sm">
      <Crown className="h-3 w-3" /> Premium
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      Gratuit
    </span>
  );

const TypeBadge = ({ type }) => {
  const cfg = getTypeConfig(type);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.badge}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
};

/* ============================================================
   Main component
   ============================================================ */

const Ressources = () => {
  const navigate = useNavigate();
  const { selectedCategory, setSelectedCategory, categoriesOrder } = useRessource();
  const [userReady, setUserReady] = useState(false);
  const [fonctionnalites, setFonctionnalites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [notConnectedMessage, setNotConnectedMessage] = useState('');

  // --- visual-only state (does not touch business logic) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState('all'); // all | free | premium
  const [sortOrder, setSortOrder] = useState('recent'); // recent | ancien
  const [favorites, setFavorites] = useState(() => new Set());
  const [modalResource, setModalResource] = useState(null);
  const [toast, setToast] = useState('');

  const fetchFonctionnalites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/fonctionnalites');
      console.log('RAW DATA:', res.data);
      console.log(
        'Types statut:',
        res.data?.map((f) => ({
          nom: f.nom,
          statut: f.statut,
          typeStatut: typeof f.statut,
        }))
      );

      if (Array.isArray(res.data)) {
        const ressourcesFiltrees = res.data
          .filter((f) => f.statut === true || f.statut === 'true' || f.statut === 1) // ← fix
          .map((f) => ({
            ...f,
            premium: f.type === 'podcast' ? true : f.premium,
          }));
        console.log('Après filtre:', ressourcesFiltrees.length, 'ressources');
        setFonctionnalites(ressourcesFiltrees);
      } else {
        throw new Error('Format de données invalide.');
      }
    } catch (err) {
      console.error('Erreur fetch:', err);
      setError('Erreur de chargement des fonctionnalités.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Sync role depuis localStorage (refresh instant UI)
  useEffect(() => {
    const syncUser = () => {
      const role = localStorage.getItem('role');

      setIsUserPremium(role === 'PREMIUM' || role === 'ADMIN');
      setUserReady(true);
    };

    syncUser();

    window.addEventListener('roleChange', syncUser);

    return () => window.removeEventListener('roleChange', syncUser);
  }, []);

  // 2. Load user + data
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setNotConnectedMessage('⚠️ Vous devez être connecté');
      navigate('/connexion');
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const res = await api.get('/auth/me');

        const role = res.data.role;

        setIsUserPremium(role === 'PREMIUM' || role === 'ADMIN');

        localStorage.setItem('role', role);

        // 🔥 IMPORTANT: notify UI partout
        window.dispatchEvent(new Event('user-updated'));
      } catch {
        setIsUserPremium(false);
      } finally {
        fetchFonctionnalites();
      }
    };

    fetchUserInfo();
  }, [navigate, fetchFonctionnalites]);

  const filteredFonctionnalites = useMemo(() => {
    return fonctionnalites.filter(
      (f) =>
        selectedCategory === 'all' ||
        (selectedCategory === 'Autres' && !categoriesOrder.some((cat) => cat.key === f.type)) ||
        f.type === selectedCategory
    );
  }, [fonctionnalites, selectedCategory, categoriesOrder]);

  // --- visual-only derived data: search + access filter + sort ---
  const searchedAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = filteredFonctionnalites.filter((f) => {
      if (!q) return true;
      const nom = (f.nom || '').toLowerCase();
      const desc = (f.description || '').toLowerCase();
      return nom.includes(q) || desc.includes(q);
    });

    if (accessFilter === 'free') list = list.filter((f) => !f.premium);
    if (accessFilter === 'premium') list = list.filter((f) => f.premium);

    const sortKey = (f) => {
      const raw = f.createdAt || f.dateCreation || f.date || f.id || 0;
      const t = new Date(raw).getTime();
      return Number.isNaN(t) ? Number(f.id) || 0 : t;
    };

    list = [...list].sort((a, b) => (sortOrder === 'recent' ? sortKey(b) - sortKey(a) : sortKey(a) - sortKey(b)));

    return list;
  }, [filteredFonctionnalites, searchQuery, accessFilter, sortOrder]);

  if (notConnectedMessage) {
    return (
      <Layout>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md mx-auto mt-20 p-8 bg-red-50 border border-red-300 rounded-2xl shadow-lg flex flex-col items-center gap-4 select-none"
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

  const gratuits = searchedAndSorted.filter((f) => !f.premium);
  const premiums = searchedAndSorted.filter((f) => f.premium);

  const resourceLinks = {
    'mini defi gratuite': '/mini-defi-gratuite',
    'liste de controle bien etre': '/liste-controle-bien-etre',
    'mini challenge decouverte': '/mini-defi-decouverte',
    'guide fixer des limites saines': '/guide-fixateur-limites',
    'auto evaluation basique': '/auto-evaluation-basique',
  };

  const normalizeNom = (nom) =>
    (nom || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Helper to get the link (route or file) for a resource (if free) — unchanged logic
  const getRessourceUrl = (f) => {
    const normalizedNom = normalizeNom(f.nom);
    if (resourceLinks[normalizedNom]) {
      return resourceLinks[normalizedNom];
    }
    return f.lienFichier || null;
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites((prev) => {
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
      // silently ignore cancelled share dialogs
    }
  };

  // Determines what happens when a card is clicked.
  // Business rule preserved: premium + not premium user -> upsell.
  // Articles keep opening their real link directly (never a blank modal).
  // Internal mapped resources keep navigating to their existing route.
  // Everything else opens in the new preview modal.
  const handleCardClick = (f) => {
    if (f.premium && !isUserPremium) {
      navigate('/devenir-premium');
      return;
    }

    const normalizedNom = normalizeNom(f.nom);
    if (resourceLinks[normalizedNom]) {
      navigate(resourceLinks[normalizedNom]);
      return;
    }

    if ((f.type || '').toLowerCase() === 'article') {
      const url = f.lienFichier;
      if (url) window.open(url, '_blank', 'noopener noreferrer');
      return;
    }

    setModalResource(f);
  };

  // Renders the actual body of a resource (video embed, podcast player, citation, article...).
  // Logic identical to the original renderResourceContent, restyled.
  const renderResourceContent = (f, { inModal = false } = {}) => {
    const { type, description, lienFichier, premium, nom } = f;

    if (premium && !isUserPremium) {
      return (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <Lock className="h-4 w-4 text-gray-400" />
          Cette ressource est réservée aux membres Premium.
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/devenir-premium');
            }}
            className="ml-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            Devenir Premium
          </button>
        </div>
      );
    }

    switch ((type || '').toLowerCase()) {
      case 'citation':
        return (
          <blockquote className={`mt-3 flex gap-2 text-gray-700 ${inModal ? 'text-lg leading-relaxed' : 'text-sm'} italic border-l-2 border-violet-300 pl-3`}>
            <Quote className="h-4 w-4 flex-shrink-0 text-violet-400" />
            <span>"{description}"</span>
          </blockquote>
        );

      case 'video':
        if (lienFichier && (lienFichier.includes('youtube.com') || lienFichier.includes('youtu.be'))) {
          const youtubeId = lienFichier.split('v=')[1]?.split('&')[0] || lienFichier.split('/').pop();
          return (
            <div className={`mt-3 overflow-hidden rounded-xl shadow-sm ${inModal ? 'aspect-video' : 'aspect-video'}`}>
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                allowFullScreen
                title={nom}
              />
            </div>
          );
        }
        return lienFichier ? (
          <a
            href={lienFichier}
            className="mt-3 inline-flex items-center gap-1 font-semibold text-indigo-600 no-underline hover:text-indigo-800"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <PlayCircle className="h-4 w-4" /> Voir la vidéo
          </a>
        ) : (
          <p className="mt-3 text-gray-800">{description}</p>
        );

      case 'podcast':
        return (
          <div className="mt-3 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <audio controls className="w-full rounded-md shadow-sm">
              <source src={lienFichier} type="audio/mpeg" />
            </audio>
            <a
              href={lienFichier}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 no-underline hover:text-indigo-800"
            >
              <Headphones className="h-4 w-4" /> Écouter le podcast
            </a>
          </div>
        );

      default:
        return (
          <div className="mt-3 text-gray-800">
            {!inModal && <p className="line-clamp-3 text-sm text-gray-600">{description}</p>}
            {inModal && <p className="leading-relaxed text-gray-700">{description}</p>}
            {lienFichier && (
              <a
                href={lienFichier}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-semibold text-indigo-600 no-underline hover:text-indigo-800"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="h-4 w-4" /> Consulter
              </a>
            )}
          </div>
        );
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  // --- stats for the sidebar (computed from the full, unfiltered dataset) ---
  const stats = useMemo(() => {
    const total = fonctionnalites.length;
    const byType = (t) => fonctionnalites.filter((f) => (f.type || '').toLowerCase() === t).length;
    const premiumCount = fonctionnalites.filter((f) => f.premium).length;
    return {
      total,
      video: byType('video'),
      podcast: byType('podcast'),
      guide: byType('guide'),
      premium: premiumCount,
      free: total - premiumCount,
    };
  }, [fonctionnalites]);

  const ResourceCard = ({ f, variant }) => {
    const isFav = favorites.has(f.id);

    return (
      <motion.div
        key={f.id}
        layout
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, scale: 1.015 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        role="button"
        tabIndex={0}
        aria-label={`Ouvrir la ressource ${f.nom}`}
        onKeyDown={(e) => (e.key === 'Enter' ? handleCardClick(f) : null)}
        onClick={() => handleCardClick(f)}
        className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
          ${
            variant === 'premium'
              ? 'border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-white/80 hover:shadow-[0_10px_30px_-8px_rgba(217,119,6,0.25)]'
              : 'border-gray-100 bg-white/80 hover:shadow-[0_10px_30px_-8px_rgba(79,70,229,0.18)]'
          }`}
      >
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <AccessBadge premium={!!f.premium} />
              <TypeBadge type={f.type} />
            </div>
            <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                onClick={(e) => toggleFavorite(e, f.id)}
                className="rounded-full p-1.5 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <motion.span whileTap={{ scale: 1.3 }} className="block">
                  <Heart className={`h-4 w-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </motion.span>
              </button>
              <button
                aria-label="Partager cette ressource"
                onClick={(e) => handleShare(e, f)}
                className="rounded-full p-1.5 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <Share2 className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900">{f.nom}</h3>
          {renderResourceContent(f)}
        </div>

      </motion.div>
    );
  };

  return (
    <Layout>
      {/* ============= HERO ============= */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-0 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:pb-14 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mx-auto flex max-w-2xl flex-col items-center text-center"
          >
            <span className="mb-4 inline-flex items-center justify-center rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-indigo-100">
              <Library className="h-7 w-7 text-indigo-600" />
            </span>
            <h1 className="select-none text-3xl font-bold text-gray-900 sm:text-4xl">Bibliothèque de Ressources</h1>
            <p className="mt-3 max-w-lg text-sm text-gray-500 sm:text-base">
              Guides, vidéos, podcasts et citations pour prendre soin de votre bien-être, à votre rythme.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="mx-auto mt-8 max-w-xl"
          >
            <div className="group relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une ressource…"
                aria-label="Rechercher une ressource"
                className="w-full rounded-2xl border border-gray-200 bg-white/90 py-3.5 pl-12 pr-4 text-sm text-gray-800 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-indigo-300 focus:shadow-md focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </motion.div>

          {/* Category tabs (business logic unchanged) */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {categoriesOrder.map(({ key, title }) => (
              <motion.button
                key={key}
                onClick={() => setSelectedCategory(key)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                aria-pressed={selectedCategory === key}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                  ${
                    selectedCategory === key
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-white/80 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
              >
                {emojiByCategory[key.toLowerCase()] || '📁'} {title}
              </motion.button>
            ))}
          </div>

          {/* Access filter pills + sort */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="flex gap-1.5 rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-gray-100">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'free', label: 'Gratuit' },
                { key: 'premium', label: 'Premium' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAccessFilter(opt.key)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    accessFilter === opt.key ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-indigo-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                aria-label="Trier les ressources"
                className="appearance-none rounded-full bg-white/80 py-2 pl-4 pr-9 text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-gray-100 outline-none transition focus:ring-2 focus:ring-indigo-300"
              >
                <option value="recent">Plus récent</option>
                <option value="ancien">Plus ancien</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ============= CONTENT ============= */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
            {/* Main column */}
            <div>
              {gratuits.length === 0 && premiums.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-10 text-center text-gray-500">
                  Aucune ressource ne correspond à votre recherche.
                </div>
              )}

              {gratuits.length > 0 && (
                <section className="mb-12">
                  <h2 className="mb-6 flex select-none items-center gap-2 border-b border-gray-200 pb-2 text-2xl font-semibold text-gray-900">
                    <Sparkles className="h-5 w-5 text-indigo-500" /> Ressources Gratuites
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                      {gratuits.map((f) => (
                        <ResourceCard key={f.id} f={f} variant="free" />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {premiums.length > 0 && (
                <section>
                  <h2 className="mb-6 flex select-none items-center gap-2 border-b border-amber-300 pb-2 text-2xl font-semibold text-amber-700">
                    <Crown className="h-5 w-5" /> Ressources Premium
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                      {premiums.map((f) => (
                        <ResourceCard key={f.id} f={f} variant="premium" />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">Statistiques</h3>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-center justify-between">
                    <span>Ressources</span>
                    <span className="font-semibold text-gray-900">{stats.total}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <PlayCircle className="h-3.5 w-3.5 text-rose-400" /> Vidéos
                    </span>
                    <span className="font-semibold text-gray-900">{stats.video}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Headphones className="h-3.5 w-3.5 text-orange-400" /> Podcasts
                    </span>
                    <span className="font-semibold text-gray-900">{stats.podcast}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-emerald-400" /> Guides
                    </span>
                    <span className="font-semibold text-gray-900">{stats.guide}</span>
                  </li>
                  <li className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                    <span>Gratuites</span>
                    <span className="font-semibold text-emerald-600">{stats.free}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Premium</span>
                    <span className="font-semibold text-amber-600">{stats.premium}</span>
                  </li>
                </ul>
              </div>

              {!isUserPremium && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 p-5 text-white shadow-lg shadow-indigo-200"
                >
                  <Crown className="h-6 w-6 text-amber-300" />
                  <h3 className="mt-3 text-base font-semibold">Passez Premium</h3>
                  <p className="mt-1 text-xs text-indigo-100">
                    Débloquez tous les podcasts, guides avancés et contenus exclusifs.
                  </p>
                  <button
                    onClick={() => navigate('/devenir-premium')}
                    className="mt-4 w-full rounded-full bg-white py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                  >
                    Devenir Premium
                  </button>
                </motion.div>
              )}
            </aside>
          </div>
        )}
      </div>

      {/* ============= MODAL ============= */}
      <AnimatePresence>
        {modalResource && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalResource(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={modalResource.nom}
              className="relative w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl"
            >
              <button
                onClick={() => setModalResource(null)}
                aria-label="Fermer"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-3 flex flex-wrap items-center gap-1.5 pr-10">
                <AccessBadge premium={!!modalResource.premium} />
                <TypeBadge type={modalResource.type} />
              </div>
              <h2 className="pr-8 text-xl font-bold text-gray-900">{modalResource.nom}</h2>
              {renderResourceContent(modalResource, { inModal: true })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============= TOAST ============= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Ressources;