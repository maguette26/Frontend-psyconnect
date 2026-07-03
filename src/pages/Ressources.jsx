import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock, Play, Download, ExternalLink, Headphones, FileText,
  Quote, BookOpen, Video, Sparkles, Library, Clock, ArrowRight
} from 'lucide-react';
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

  useEffect(() => {
    const syncUser = () => {
      const role = localStorage.getItem("role");
      setIsUserPremium(role === "PREMIUM" || role === "ADMIN");
    };
    syncUser();
    window.addEventListener("roleChange", syncUser);
    return () => window.removeEventListener("roleChange", syncUser);
  }, []);

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

  const handlePremiumClick = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      navigate('/devenir-premium');
    }
  };

  // ---- Statistiques calculées à partir des données existantes ----
  const stats = useMemo(() => {
    const total = fonctionnalites.length;
    const videos = fonctionnalites.filter(f => f.type?.toLowerCase() === 'video').length;
    const podcasts = fonctionnalites.filter(f => f.type?.toLowerCase() === 'podcast').length;
    const guides = fonctionnalites.filter(f => f.type?.toLowerCase() === 'guide').length;
    return [
      { icon: Library, label: 'Ressources', value: total },
      { icon: Video, label: 'Vidéos', value: videos },
      { icon: Headphones, label: 'Podcasts', value: podcasts },
      { icon: BookOpen, label: 'Guides', value: guides },
    ];
  }, [fonctionnalites]);

  const iconByCategory = {
    all: Sparkles,
    citation: Quote,
    video: Video,
    podcast: Headphones,
    article: FileText,
    livre: BookOpen,
    guide: BookOpen,
    autres: Library,
  };

  const typeIcon = (type) => {
    const map = {
      citation: Quote,
      video: Video,
      podcast: Headphones,
      article: FileText,
      livre: BookOpen,
      guide: BookOpen,
    };
    return map[type?.toLowerCase()] || FileText;
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

  const getYoutubeId = (lienFichier) =>
    lienFichier?.includes('v=')
      ? lienFichier.split('v=')[1]?.split('&')[0]
      : lienFichier?.split('/').pop();

  // ---- Rendu du "media" en haut de carte, selon le type ----
  const renderCardMedia = (f) => {
    const { type, lienFichier, nom, premium } = f;
    const Icon = typeIcon(type);
    const isLocked = premium && !isUserPremium;

    switch (type?.toLowerCase()) {
      case 'citation':
        return (
          <div className="relative h-40 rounded-t-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-600 flex items-center justify-center overflow-hidden">
            <Quote className="absolute -top-3 -left-2 text-white/20" size={90} strokeWidth={1} />
            <Quote className="text-white/90" size={34} strokeWidth={1.5} />
            <div className="absolute bottom-3 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm" />
          </div>
        );

      case 'video': {
        const youtubeId = lienFichier && (lienFichier.includes('youtube.com') || lienFichier.includes('youtu.be'))
          ? getYoutubeId(lienFichier)
          : null;
        return (
          <div className="relative h-40 rounded-t-2xl overflow-hidden bg-slate-900 group/media">
            {youtubeId ? (
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                alt={nom}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-black/25 group-hover/media:bg-black/35 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/media:scale-110">
                {isLocked ? <Lock size={18} className="text-slate-700" /> : <Play size={18} className="text-blue-600 ml-0.5" fill="currentColor" />}
              </div>
            </div>
          </div>
        );
      }

      case 'podcast':
        return (
          <div className="relative h-40 rounded-t-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
            <Headphones className="text-white/90" size={44} strokeWidth={1.3} />
            <span className="absolute top-3 left-3 text-[11px] font-semibold bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
              🎧 Podcast
            </span>
          </div>
        );

      case 'guide':
        return (
          <div className="relative h-40 rounded-t-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
            <FileText className="text-blue-500" size={44} strokeWidth={1.3} />
          </div>
        );

      default:
        return (
          <div className="relative h-40 rounded-t-2xl bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center overflow-hidden">
            <Icon className="text-blue-400" size={40} strokeWidth={1.3} />
          </div>
        );
    }
  };

  // ---- Conserve la logique existante de contenu / liens / clics ----
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
        <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
          <Lock size={15} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <p>
              {isAuthenticated
                ? "Réservé aux membres Premium."
                : "Réservé aux membres connectés."}
            </p>
            <button
              onClick={handlePremiumClick}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              {isAuthenticated ? "Devenir Premium" : "Se connecter"}
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      );
    }

    if (resourceLinks[normalizedNom]) {
      return (
        <Link
          to={resourceLinks[normalizedNom]}
          className="inline-flex items-center gap-1.5 mt-3 text-blue-600 font-semibold text-sm no-underline hover:text-blue-800 hover:no-underline transition-colors"
          onClick={(e) => {
            if (premium && !isUserPremium) {
              e.preventDefault();
              handlePremiumClick();
            }
          }}
        >
          Accéder à la ressource <ArrowRight size={14} />
        </Link>
      );
    }

    switch (type.toLowerCase()) {
      case 'citation':
        return (
          <blockquote className="mt-1 text-center text-slate-700 font-medium italic leading-relaxed">
            "{description}"
          </blockquote>
        );

      case 'video':
        return (
          lienFichier
            ? null // le bouton Play est géré visuellement dans le media, le clic global de la carte ouvre le lien
            : <p className="mt-3 text-sm text-slate-600 line-clamp-3">{description}</p>
        );

      case 'podcast':
        return (
          <div className="mt-3 flex flex-col gap-2">
            <audio controls className="w-full rounded-lg shadow-sm h-9">
              <source src={lienFichier} type="audio/mpeg" />
            </audio>
          </div>
        );

      default:
        return (
          <p className="mt-2 text-sm text-slate-600 line-clamp-3">{description}</p>
        );
    }
  };

  // ---- Boutons bas de carte : "Voir" + "Télécharger/Ouvrir" ----
  const renderCardActions = (f) => {
    const { premium, lienFichier, type } = f;
    const isLocked = premium && !isUserPremium;
    const url = getRessourceUrl(f);
    const isPodcast = type?.toLowerCase() === 'podcast';

    const handleOpen = (e) => {
      e.stopPropagation();
      if (isLocked) {
        handlePremiumClick();
        return;
      }
      if (url) {
        url.startsWith('/') ? navigate(url) : window.open(url, '_blank', 'noopener noreferrer');
      }
    };

    return (
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleOpen}
          className="relative overflow-hidden flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 active:scale-95 transition-all duration-200"
        >
          <ExternalLink size={14} />
          Voir
        </button>
        {(lienFichier || url) && !isPodcast && (
          <button
            onClick={handleOpen}
            className="relative overflow-hidden flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isLocked ? <Lock size={14} /> : <Download size={14} />}
            {isLocked ? 'Premium' : 'Ouvrir'}
          </button>
        )}
      </div>
    );
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <Layout>
      {/* ---------- HERO ---------- */}
      <div className="relative bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 pt-14 pb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md shadow-blue-100 border border-blue-100 mb-5"
          >
            <Library className="text-blue-600" size={30} strokeWidth={1.6} />
          </motion.div>

          <motion.h1
            className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
          >
            Bibliothèque de Ressources
          </motion.h1>

          <motion.p
            className="mt-3 text-slate-500 text-base max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            Découvrez des ressources sélectionnées par des professionnels pour améliorer votre bien-être mental.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 -mt-2">

        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl mx-auto text-center bg-white border border-slate-100 rounded-3xl shadow-lg shadow-blue-100/50 px-8 py-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
              <Lock className="text-blue-500" size={26} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Connexion requise
            </h2>
            <p className="text-sm text-slate-500 mb-7 leading-relaxed">
              La bibliothèque de ressources est réservée aux membres connectés.
              Connectez-vous ou créez un compte gratuitement pour y accéder.
            </p>
            <button
              onClick={() => navigate('/connexion')}
              className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 transition-all active:scale-95"
            >
              Se connecter
            </button>
          </motion.div>
        ) : (
          <>
            {/* ---------- CATEGORIES (pills) ---------- */}
            <div className="flex flex-wrap gap-2.5 justify-center mb-8">
              {categoriesOrder.map(({ key, title }) => {
                const CatIcon = iconByCategory[key.toLowerCase()] || Library;
                const active = selectedCategory === key;
                return (
                  <motion.button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 backdrop-blur-sm
                      ${active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                        : 'bg-white/70 text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'}`}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.15 }}
                    aria-pressed={active}
                  >
                    <CatIcon size={14} />
                    {title}
                  </motion.button>
                );
              })}
            </div>

            {/* ---------- STATISTIQUES ---------- */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3.5 shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <s.icon size={17} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800 leading-none">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-4 rounded-2xl mb-6">
                {error}
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && (
              <>
                {gratuits.length > 0 && (
                  <section className="mb-14">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Sparkles size={18} className="text-blue-500" />
                      Ressources Gratuites
                    </h2>
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      initial="hidden"
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                    >
                      {gratuits.map((f, index) => {
                        const url = getRessourceUrl(f);
                        const TypeIcon = typeIcon(f.type);
                        const isCitation = f.type?.toLowerCase() === 'citation';
                        return (
                          <motion.div
                            key={f.id}
                            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/60 overflow-hidden flex flex-col cursor-pointer transition-shadow duration-300"
                            variants={cardVariants}
                            transition={{ duration: 0.35, delay: index * 0.06 }}
                            whileHover={{ y: -4 }}
                            onClick={() => {
                              if (url) {
                                url.startsWith('/') ? navigate(url) : window.open(url, '_blank', 'noopener noreferrer');
                              }
                            }}
                          >
                            {renderCardMedia(f)}

                            <div className="p-5 flex flex-col flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                  <TypeIcon size={11} />
                                  {f.type}
                                </span>
                                {f.dateCreation && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                    <Clock size={11} />
                                    {new Date(f.dateCreation).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>

                              {!isCitation && (
                                <h3 className="font-semibold text-slate-800 leading-snug mb-1 line-clamp-2">
                                  {f.nom}
                                </h3>
                              )}

                              <div className={isCitation ? "flex-1 flex items-center justify-center py-2" : "flex-1"}>
                                {renderResourceContent(f)}
                              </div>

                              {renderCardActions(f)}
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </section>
                )}

                {premiums.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-amber-700 mb-6 flex items-center gap-2">
                      <Lock size={17} />
                      Ressources Premium
                    </h2>
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      initial="hidden"
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                    >
                      {premiums.map((f, index) => {
                        const TypeIcon = typeIcon(f.type);
                        const isCitation = f.type?.toLowerCase() === 'citation';
                        return (
                          <motion.div
                            key={f.id}
                            className="group relative bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-xl hover:shadow-amber-100/60 overflow-hidden flex flex-col cursor-pointer transition-shadow duration-300"
                            variants={cardVariants}
                            transition={{ duration: 0.35, delay: index * 0.06 }}
                            whileHover={{ y: -4 }}
                            onClick={handlePremiumClick}
                            title={isAuthenticated ? "Cette ressource nécessite un abonnement Premium" : "Connectez-vous pour accéder à cette ressource"}
                          >
                            <div className="relative">
                              {renderCardMedia(f)}
                              <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                                <Lock size={10} /> Premium
                              </span>
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                                  <TypeIcon size={11} />
                                  {f.type}
                                </span>
                                {f.dateCreation && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                    <Clock size={11} />
                                    {new Date(f.dateCreation).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>

                              {!isCitation && (
                                <h3 className="font-semibold text-slate-800 leading-snug mb-1 line-clamp-2">
                                  {f.nom}
                                </h3>
                              )}

                              <div className={isCitation ? "flex-1 flex items-center justify-center py-2" : "flex-1"}>
                                {renderResourceContent(f)}
                              </div>

                              {renderCardActions(f)}
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
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