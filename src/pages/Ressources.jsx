import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock, Play, Download, ExternalLink, Headphones, FileText,
  Quote, BookOpen, Video, Sparkles, Library, Clock, ArrowRight,
  Heart, Share2, Copy, X, Eye, Star, Check, Search, Crown,
  MessageCircle, ArrowUpDown, Leaf
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

  // ============================================================
  // ÉTAT UI UNIQUEMENT (aucun impact sur la logique métier) :
  // gère l'ouverture des modals de lecture, les favoris locaux,
  // la recherche, le filtre gratuit/premium et le tri d'affichage.
  // Les favoris ne sont pas persistés côté API (aucun endpoint
  // n'existe pour ça dans le code fourni) — à brancher plus tard
  // si besoin d'une vraie persistance.
  // ============================================================
  const [activeModal, setActiveModal] = useState(null); // { type, resource } | null
  const [favoris, setFavoris] = useState(() => new Set());
  const [copiedId, setCopiedId] = useState(null);
  const [shareFeedbackId, setShareFeedbackId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [freeFilter, setFreeFilter] = useState('all'); // 'all' | 'free' | 'premium'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'oldest'
  const [searchFocused, setSearchFocused] = useState(false);

  // ============================================================
  // LOGIQUE MÉTIER INCHANGÉE À PARTIR D'ICI
  // ============================================================

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

  // ============================================================
  // FIN DE LA LOGIQUE MÉTIER INCHANGÉE
  // ============================================================

  // ============================================================
  // NOUVEAU — UI / PRÉSENTATION UNIQUEMENT
  // ============================================================

  // Palette de badges par type, dans les tons PsyConnect (bleu
  // principal conservé) + accents doux pour différencier les types.
  const typeConfig = {
    citation: { label: 'Citation', badge: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100', dot: 'bg-violet-500', icon: Quote },
    article: { label: 'Article', badge: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100', dot: 'bg-blue-500', icon: FileText },
    video: { label: 'Vidéo', badge: 'bg-rose-50 text-rose-600 ring-1 ring-rose-100', dot: 'bg-rose-500', icon: Video },
    podcast: { label: 'Podcast', badge: 'bg-orange-50 text-orange-600 ring-1 ring-orange-100', dot: 'bg-orange-500', icon: Headphones },
    guide: { label: 'Guide', badge: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100', dot: 'bg-emerald-500', icon: BookOpen },
  };

  const getTypeConfig = (type) =>
    typeConfig[type?.toLowerCase()] || { label: type || 'Ressource', badge: 'bg-slate-50 text-slate-600 ring-1 ring-slate-100', dot: 'bg-slate-400', icon: FileText };

  const isYoutube = (lienFichier) =>
    !!lienFichier && (lienFichier.includes('youtube.com') || lienFichier.includes('youtu.be'));

  const toggleFavori = (id, e) => {
    e?.stopPropagation();
    setFavoris(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleShare = async (f, e) => {
    e?.stopPropagation();
    const shareData = {
      title: f.nom,
      text: f.description || f.nom,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareFeedbackId(f.id);
        setTimeout(() => setShareFeedbackId(null), 1800);
      }
    } catch {
      // partage annulé par l'utilisateur : rien à faire
    }
  };

  const handleCopyCitation = async (f, e) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(f.description || '');
      setCopiedId(f.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // clipboard indisponible : on ignore silencieusement
    }
  };

  // Détermine ce qui se passe au clic principal sur une carte,
  // sans jamais modifier la logique d'accès premium existante.
  const handleCardOpen = (f) => {
    if (f.premium && !isUserPremium) {
      handlePremiumClick();
      return;
    }
    const type = f.type?.toLowerCase();
    if (type === 'video' && isYoutube(f.lienFichier)) {
      setActiveModal({ type: 'video', resource: f });
      return;
    }
    if (type === 'article') {
      setActiveModal({ type: 'article', resource: f });
      return;
    }
    if (type === 'guide') {
      setActiveModal({ type: 'pdf', resource: f });
      return;
    }
    if (type === 'citation') {
      setActiveModal({ type: 'citation', resource: f });
      return;
    }
    if (type === 'podcast') {
      setActiveModal({ type: 'podcast', resource: f });
      return;
    }
    // autres cas : comportement d'ouverture externe conservé
    const url = getRessourceUrl(f);
    if (url) {
      url.startsWith('/') ? navigate(url) : window.open(url, '_blank', 'noopener noreferrer');
    }
  };

  // Couche d'affichage supplémentaire (recherche + filtre gratuit/premium
  // + tri) appliquée PAR-DESSUS le filtrage métier existant
  // (filteredFonctionnalites, catégories). Ne modifie rien en amont.
  const displayResources = useMemo(() => {
    let list = [...filteredFonctionnalites];

    if (freeFilter === 'free') list = list.filter(f => !f.premium);
    if (freeFilter === 'premium') list = list.filter(f => f.premium);

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(f =>
        f.nom?.toLowerCase().includes(term) ||
        f.description?.toLowerCase().includes(term)
      );
    }

    list.sort((a, b) => {
      const da = a.dateCreation ? new Date(a.dateCreation).getTime() : 0;
      const db = b.dateCreation ? new Date(b.dateCreation).getTime() : 0;
      return sortBy === 'recent' ? db - da : da - db;
    });

    return list;
  }, [filteredFonctionnalites, freeFilter, searchTerm, sortBy]);

  const displayGratuits = displayResources.filter(f => !f.premium);
  const displayPremiums = displayResources.filter(f => f.premium);

  // Stats réelles pour la sidebar "Aperçu rapide" — calculées à partir
  // de toutes les ressources reçues (fonctionnalites), pas seulement
  // celles affichées après filtrage, pour rester représentatives.
  const sidebarStats = useMemo(() => {
    const total = fonctionnalites.length;
    const videos = fonctionnalites.filter(f => f.type?.toLowerCase() === 'video').length;
    const podcasts = fonctionnalites.filter(f => f.type?.toLowerCase() === 'podcast').length;
    const articles = fonctionnalites.filter(f => f.type?.toLowerCase() === 'article').length;
    const guides = fonctionnalites.filter(f => f.type?.toLowerCase() === 'guide').length;
    const gratuitesCount = fonctionnalites.filter(f => !f.premium).length;
    const premiumsCount = fonctionnalites.filter(f => f.premium).length;
    return [
      { icon: Library, label: 'Ressources totales', value: total, color: 'text-slate-600' },
      { icon: Video, label: 'Vidéos', value: videos, color: 'text-rose-500' },
      { icon: Headphones, label: 'Podcasts', value: podcasts, color: 'text-orange-500' },
      { icon: FileText, label: 'Articles', value: articles, color: 'text-blue-500' },
      { icon: BookOpen, label: 'Guides', value: guides, color: 'text-emerald-500' },
      { icon: Check, label: 'Gratuites', value: gratuitesCount, color: 'text-emerald-600' },
      { icon: Crown, label: 'Premium', value: premiumsCount, color: 'text-amber-500' },
    ];
  }, [fonctionnalites]);

  // Boutons d'action spécifiques au type de ressource (fond de carte),
  // remplace les deux boutons redondants "Voir" / "Ouvrir" d'origine.
  const CardActionButton = ({ onClick, icon: Icon, label, primary, done }) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95
        ${primary
          ? 'flex-1 bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
          : 'w-9 h-9 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
      title={label}
    >
      <Icon size={14} className={done ? 'text-emerald-500' : ''} />
      {primary && <span>{done ? 'Copié' : label}</span>}
    </button>
  );

  const renderCardActions = (f) => {
    const isLocked = f.premium && !isUserPremium;
    const type = f.type?.toLowerCase();
    const isFav = favoris.has(f.id);

    if (isLocked) {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); handlePremiumClick(); }}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 shadow-sm"
        >
          <Lock size={13} />
          {isAuthenticated ? 'Débloquer en Premium' : 'Se connecter'}
        </button>
      );
    }

    const FavIcon = () => (
      <button
        onClick={(e) => toggleFavori(f.id, e)}
        className="w-9 h-9 inline-flex items-center justify-center rounded-xl bg-slate-50 hover:bg-rose-50 transition-all duration-200 active:scale-95"
        title="Favori"
      >
        <Heart size={14} className={isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
      </button>
    );

    if (type === 'video') {
      return (
        <div className="flex items-center gap-2">
          <CardActionButton onClick={(e) => { e.stopPropagation(); handleCardOpen(f); }} icon={Play} label="Regarder" primary />
          <FavIcon />
          <CardActionButton onClick={(e) => handleShare(f, e)} icon={Share2} label="Partager" />
        </div>
      );
    }

    if (type === 'guide') {
      return (
        <div className="flex items-center gap-2">
          <CardActionButton onClick={(e) => { e.stopPropagation(); handleCardOpen(f); }} icon={Eye} label="Prévisualiser" primary />
          {f.lienFichier && (
            <a
              href={f.lienFichier}
              download
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 inline-flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95"
              title="Télécharger"
            >
              <Download size={14} />
            </a>
          )}
          <FavIcon />
        </div>
      );
    }

    if (type === 'article') {
      return (
        <div className="flex items-center gap-2">
          <CardActionButton onClick={(e) => { e.stopPropagation(); handleCardOpen(f); }} icon={FileText} label="Lire l'article" primary />
          <FavIcon />
          <CardActionButton onClick={(e) => handleShare(f, e)} icon={Share2} label="Partager" />
        </div>
      );
    }

    if (type === 'citation') {
      return (
        <div className="flex items-center gap-2">
          <FavIcon />
          <CardActionButton
            onClick={(e) => handleCopyCitation(f, e)}
            icon={copiedId === f.id ? Check : Copy}
            label="Copier"
            primary
            done={copiedId === f.id}
          />
        </div>
      );
    }

    if (type === 'podcast') {
      return (
        <div className="flex items-center gap-2">
          <CardActionButton onClick={(e) => { e.stopPropagation(); handleCardOpen(f); }} icon={Play} label="Écouter" primary />
          <FavIcon />
        </div>
      );
    }

    // autres types : favori + partage
    return (
      <div className="flex items-center gap-2">
        <FavIcon />
        <CardActionButton onClick={(e) => handleShare(f, e)} icon={Share2} label="Partager" />
      </div>
    );
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  // Carte élégante : icône + badges colorés par type, glassmorphism subtil.
  const ResourceCard = ({ f, index }) => {
    const cfg = getTypeConfig(f.type);
    const TypeIcon = cfg.icon;
    const isLocked = f.premium && !isUserPremium;
    const type = f.type?.toLowerCase();

    return (
      <motion.div
        key={f.id}
        variants={cardVariants}
        transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4), ease: 'easeOut' }}
        whileHover={{ y: -6, scale: 1.02 }}
        className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/60 transition-shadow duration-300 flex flex-col cursor-pointer overflow-hidden"
        onClick={() => handleCardOpen(f)}
      >
        <span className={`absolute top-0 left-0 right-0 h-1 ${cfg.dot}`} />

        <div className="p-5 flex flex-col flex-1">
          {/* En-tête : icône + statut */}
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${cfg.badge}`}>
              <TypeIcon size={17} />
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                f.premium ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {f.premium && <Crown size={10} />}
                {f.premium ? 'Premium' : 'Gratuit'}
              </span>
              <button
                onClick={(e) => toggleFavori(f.id, e)}
                className="w-7 h-7 inline-flex items-center justify-center rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <Heart size={13} className={favoris.has(f.id) ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
            </div>
          </div>

          <span className={`self-start text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-2 ${cfg.badge}`}>
            {cfg.label}
          </span>

          {type !== 'citation' ? (
            <h3 className="font-semibold text-slate-800 leading-snug mb-1.5 line-clamp-2">
              {f.nom}
            </h3>
          ) : (
            <div className="flex-1 flex flex-col justify-center py-1 mb-2">
              <Quote className="text-violet-200 mb-1" size={22} strokeWidth={1.5} />
              <blockquote className="text-slate-700 font-medium italic leading-relaxed line-clamp-4">
                {f.description}
              </blockquote>
            </div>
          )}

          {type !== 'citation' && f.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{f.description}</p>
          )}

          {/* Métadonnées optionnelles — n'affiche que ce qui existe réellement */}
          {(f.duree || f.categorie || f.vues != null || f.note != null || f.dateCreation ||
            (type === 'guide' && (f.telechargements != null || f.pages != null))) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mb-3">
              {f.duree && (
                <span className="inline-flex items-center gap-1"><Clock size={11} />{f.duree}</span>
              )}
              {f.categorie && <span>{f.categorie}</span>}
              {f.vues != null && (
                <span className="inline-flex items-center gap-1"><Eye size={11} />{f.vues} vues</span>
              )}
              {f.note != null && (
                <span className="inline-flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" />{f.note}</span>
              )}
              {type === 'guide' && f.telechargements != null && (
                <span className="inline-flex items-center gap-1"><Download size={11} />{f.telechargements} téléchargements</span>
              )}
              {type === 'guide' && f.pages != null && (
                <span>PDF · {f.pages} pages</span>
              )}
              {f.dateCreation && (
                <span>{new Date(f.dateCreation).toLocaleDateString('fr-FR')}</span>
              )}
            </div>
          )}

          {shareFeedbackId === f.id && (
            <p className="text-[11px] text-emerald-600 mb-2">Lien copié ✓</p>
          )}

          <div className="mt-auto pt-1">
            {renderCardActions(f)}
          </div>
        </div>
      </motion.div>
    );
  };

  // ---- Modal générique ----
  const ModalShell = ({ children, wide }) => (
    <AnimatePresence>
      {activeModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setActiveModal(null)}
        >
          <motion.div
            className={`bg-white rounded-3xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[88vh] overflow-y-auto`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ModalHeader = ({ f }) => {
    const cfg = getTypeConfig(f.type);
    return (
      <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
        <div>
          <span className={`inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${cfg.badge} mb-2`}>
            {cfg.label}
          </span>
          <h2 className="text-xl font-bold text-slate-800 leading-snug">{f.nom}</h2>
        </div>
        <button
          onClick={() => setActiveModal(null)}
          className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  const ModalFooterActions = ({ f, extra }) => {
    const isFav = favoris.has(f.id);
    return (
      <div className="flex items-center gap-2 px-6 pb-6 pt-4">
        {extra}
        <button
          onClick={(e) => toggleFavori(f.id, e)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 text-sm font-semibold text-slate-600 hover:bg-rose-50 transition-colors"
        >
          <Heart size={14} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
          Favori
        </button>
        <button
          onClick={(e) => handleShare(f, e)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Share2 size={14} />
          Partager
        </button>
      </div>
    );
  };

  const renderModalContent = () => {
    if (!activeModal) return null;
    const { type, resource: f } = activeModal;

    if (type === 'video') {
      const youtubeId = getYoutubeId(f.lienFichier);
      return (
        <ModalShell wide>
          <ModalHeader f={f} />
          <div className="px-6">
            <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
              {youtubeId && (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={f.nom}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            {f.description && (
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">{f.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-3">
              {f.duree && <span className="inline-flex items-center gap-1"><Clock size={12} />{f.duree}</span>}
              {f.categorie && <span>{f.categorie}</span>}
            </div>
          </div>
          <ModalFooterActions f={f} />
        </ModalShell>
      );
    }

    if (type === 'article') {
      return (
        <ModalShell wide>
          <ModalHeader f={f} />
          <div className="px-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mb-4">
              {f.auteur && <span>Par {f.auteur}</span>}
              {f.dateCreation && <span>{new Date(f.dateCreation).toLocaleDateString('fr-FR')}</span>}
              {f.categorie && <span>{f.categorie}</span>}
              {f.duree && <span className="inline-flex items-center gap-1"><Clock size={12} />{f.duree}</span>}
            </div>
            {f.contenu && /<[a-z][\s\S]*>/i.test(f.contenu) ? (
              <div
                className="prose prose-sm max-w-none text-slate-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: f.contenu }}
              />
            ) : (
              <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                {f.contenu || f.description}
              </div>
            )}
          </div>
          <ModalFooterActions f={f} />
        </ModalShell>
      );
    }

    if (type === 'pdf') {
      return (
        <ModalShell wide>
          <ModalHeader f={f} />
          <div className="px-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mb-4">
              <span className="inline-flex items-center gap-1"><FileText size={12} />PDF</span>
              {f.pages != null ? (
                <span>{f.pages} pages</span>
              ) : (
                <span className="text-slate-300">Pages non disponible</span>
              )}
              {f.telechargements != null && (
                <span className="inline-flex items-center gap-1"><Download size={12} />{f.telechargements} téléchargements</span>
              )}
            </div>
            {f.lienFichier ? (
              <iframe
                src={f.lienFichier}
                title={f.nom}
                className="w-full h-[60vh] rounded-2xl border border-slate-100"
              />
            ) : (
              <p className="text-sm text-slate-500">Aucun document disponible.</p>
            )}
          </div>
          <ModalFooterActions
            f={f}
            extra={f.lienFichier && (
              <a
                href={f.lienFichier}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Download size={14} />
                Télécharger
              </a>
            )}
          />
        </ModalShell>
      );
    }

    if (type === 'podcast') {
      return (
        <ModalShell>
          <ModalHeader f={f} />
          <div className="px-6">
            {f.description && (
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{f.description}</p>
            )}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 mb-2">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <Headphones className="text-orange-600" size={22} />
              </div>
              {f.lienFichier ? (
                <audio controls autoPlay className="w-full h-10 rounded-lg">
                  <source src={f.lienFichier} type="audio/mpeg" />
                </audio>
              ) : (
                <p className="text-sm text-slate-500">Aucun fichier audio disponible.</p>
              )}
            </div>
            {f.duree && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Clock size={12} />{f.duree}
              </span>
            )}
          </div>
          <ModalFooterActions f={f} />
        </ModalShell>
      );
    }

    if (type === 'citation') {
      return (
        <ModalShell>
          <div className="relative rounded-t-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 px-8 py-12 text-center overflow-hidden">
            <Quote className="absolute -top-4 -left-2 text-white/10" size={110} strokeWidth={1} />
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
            >
              <X size={16} />
            </button>
            <p className="relative text-white text-2xl font-serif italic leading-relaxed">
              "{f.description}"
            </p>
          </div>
          <ModalFooterActions
            f={f}
            extra={
              <button
                onClick={(e) => handleCopyCitation(f, e)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                {copiedId === f.id ? <Check size={14} /> : <Copy size={14} />}
                {copiedId === f.id ? 'Copié' : 'Copier'}
              </button>
            }
          />
        </ModalShell>
      );
    }

    return null;
  };

  // ============================================================
  // FIN DU CODE UI NOUVEAU
  // ============================================================

  return (
    <Layout>
      {/* ---------- HERO ---------- */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-transparent">
        {/* illustration vectorielle discrète */}
        <div className="pointer-events-none absolute -top-10 right-[-40px] w-72 h-72 rounded-full bg-gradient-to-br from-blue-200/30 to-violet-200/30 blur-2xl hidden md:block" />
        <div className="pointer-events-none absolute top-10 right-10 hidden lg:flex items-end gap-3 opacity-70">
          <Leaf className="text-emerald-300" size={64} strokeWidth={1.2} />
          <BookOpen className="text-blue-300 -mb-2" size={80} strokeWidth={1.2} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-14 pb-10 text-center">
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

          {/* ---------- BARRE DE RECHERCHE ---------- */}
          {isAuthenticated && (
            <motion.div
              className="mt-7 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
            >
              <div
                className={`relative flex items-center bg-white rounded-2xl shadow-sm transition-shadow duration-200 ${
                  searchFocused ? 'shadow-lg shadow-blue-100 ring-2 ring-blue-200' : 'ring-1 ring-slate-100'
                }`}
              >
                <Search size={18} className="absolute left-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Rechercher une ressource, un sujet…"
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </motion.div>
          )}
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
            {/* ---------- COLONNE PRINCIPALE ---------- */}
            <div>
              {/* ---------- CATEGORIES (1er niveau, pills) ---------- */}
              <div className="flex flex-wrap gap-2.5 mb-4">
                {categoriesOrder.map(({ key, title }) => {
                  const CatIcon = iconByCategory[key.toLowerCase()] || Library;
                  const active = selectedCategory === key;
                  return (
                    <motion.button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                        ${active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'}`}
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

              {/* ---------- 2e NIVEAU : Gratuit / Premium + Tri ---------- */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                <div className="inline-flex items-center gap-1 bg-slate-100/70 p-1 rounded-full">
                  {[
                    { key: 'all', label: 'Tous' },
                    { key: 'free', label: 'Gratuit', icon: Check },
                    { key: 'premium', label: 'Premium', icon: Crown },
                  ].map((opt) => {
                    const active = freeFilter === opt.key;
                    const OptIcon = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setFreeFilter(opt.key)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                          ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {OptIcon && (
                          <OptIcon size={12} className={active && opt.key === 'premium' ? 'text-amber-500' : active && opt.key === 'free' ? 'text-emerald-500' : ''} />
                        )}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <ArrowUpDown size={13} />
                  <span className="hidden sm:inline">Trier par :</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="recent">Plus récentes</option>
                    <option value="oldest">Plus anciennes</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-4 rounded-2xl mb-6">
                  {error}
                </div>
              )}

              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-56 rounded-2xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              )}

              {!loading && displayResources.length === 0 && (
                <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl">
                  <Search className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-sm text-slate-500">Aucune ressource ne correspond à votre recherche.</p>
                </div>
              )}

              {!loading && displayResources.length > 0 && (
                <>
                  {displayGratuits.length > 0 && (
                    <section className="mb-14">
                      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Sparkles size={18} className="text-blue-500" />
                        Ressources Gratuites
                      </h2>
                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                      >
                        {displayGratuits.map((f, index) => (
                          <ResourceCard key={f.id} f={f} index={index} />
                        ))}
                      </motion.div>
                    </section>
                  )}

                  {displayPremiums.length > 0 && (
                    <section>
                      <h2 className="text-xl font-bold text-amber-700 mb-6 flex items-center gap-2">
                        <Crown size={17} />
                        Ressources Premium
                      </h2>
                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                      >
                        {displayPremiums.map((f, index) => (
                          <ResourceCard key={f.id} f={f} index={index} />
                        ))}
                      </motion.div>
                    </section>
                  )}
                </>
              )}
            </div>

            {/* ---------- SIDEBAR ---------- */}
            <aside className="space-y-5 lg:sticky lg:top-6">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5"
              >
                <h3 className="text-sm font-bold text-slate-800 mb-4">Aperçu rapide</h3>
                <ul className="space-y-3">
                  {sidebarStats.map((s) => (
                    <li key={s.label} className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-slate-500">
                        <s.icon size={14} className={s.color} />
                        {s.label}
                      </span>
                      <span className="font-bold text-slate-800">{s.value}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {!isUserPremium && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200/50"
                >
                  <Crown className="absolute -bottom-3 -right-3 text-white/10" size={90} strokeWidth={1} />
                  <p className="relative font-bold leading-snug mb-1.5">
                    Accédez à toutes les ressources Premium
                  </p>
                  <p className="relative text-xs text-blue-100 mb-4 leading-relaxed">
                    Débloquez du contenu exclusif créé par nos professionnels.
                  </p>
                  <button
                    onClick={handlePremiumClick}
                    className="relative inline-flex items-center gap-1.5 bg-white text-blue-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors active:scale-95"
                  >
                    <Crown size={13} />
                    Devenir Premium
                  </button>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <MessageCircle className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Besoin d'aide ?</p>
                    <p className="text-xs text-slate-400">Notre équipe est là pour vous accompagner.</p>
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Nous contacter
                  <ArrowRight size={12} />
                </Link>
              </motion.div>
            </aside>
          </div>
        )}
      </div>

      {renderModalContent()}

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