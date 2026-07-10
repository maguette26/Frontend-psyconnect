import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../services/serviceAuth';
import {
  HeartPulse, Home, Info, BookOpen, MessageCircle,
  Bot, User, CalendarCheck, Crown, LogOut, ChevronDown,
  ChevronRight, Menu, X, UserPlus
} from 'lucide-react';

// ─── Clés localStorage utilisées à la connexion ───────────────────────────────
// Stocke : role = "ROLE_USER" | "ROLE_PSYCHIATRE" | "ROLE_PSYCHOLOGUE" | "ROLE_ADMIN" | "ROLE_PREMIUM"
// OU      role = "UTILISATEUR" | "PSYCHIATRE" | "PSYCHOLOGUE" | "ADMIN" | "PREMIUM"
// On normalise ici pour les deux formats.
const normalizeRole = (raw) => {
  if (!raw) return null;
  const r = raw.toUpperCase().replace('ROLE_', '');
  if (r === 'USER') return 'UTILISATEUR';
  return r;
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRole, setCurrentRole] = useState(() => normalizeRole(localStorage.getItem('role')));
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef(null);
  const authMenuRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const update = () => setCurrentRole(normalizeRole(localStorage.getItem('role')));
    update();
    window.addEventListener('roleChange', update);
    window.addEventListener('storage', update);
    window.addEventListener('user-updated', update);
    return () => {
      window.removeEventListener('roleChange', update);
      window.removeEventListener('storage', update);
      window.removeEventListener('user-updated', update);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (authMenuRef.current && !authMenuRef.current.contains(e.target)) setAuthMenuOpen(false);
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) setSidebarOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Empêche le scroll du body quand la sidebar mobile/tablette est ouverte
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // 🔧 CORRECTION : un utilisateur PREMIUM est un USER avec des droits en plus.
  // Avant : isUser ne testait que 'UTILISATEUR', donc un PREMIUM tombait dans
  // aucune des 3 catégories => showMenu = false => "Mon Espace" disparaissait
  // du header (desktop, tablette ET bottom nav mobile), et le PREMIUM se
  // retrouvait traité comme un visiteur non connecté dans la nav mobile.
  const isUser  = ['UTILISATEUR', 'PREMIUM'].includes(currentRole);
  const isPro   = ['PSYCHIATRE', 'PSYCHOLOGUE'].includes(currentRole);
  const isAdmin = currentRole === 'ADMIN';
  const showMenu = isUser || isPro || isAdmin;
  const isPremium = ['PREMIUM', 'ADMIN'].includes(currentRole);
  const isAuthenticated = !!currentRole;

  // 🔧 CORRECTION : ternaires rendus explicites (plus de "else" implicite
  // qui redirigeait tout rôle non catégorisé vers /tableauAdmin).
  const espaceLink = isAdmin
    ? '/tableauAdmin'
    : isPro
      ? '/tableauProfessionnel'
      : isUser
        ? '/tableauUtilisateur'
        : '/';

  const espaceLabel = isAdmin
    ? 'Espace Admin'
    : isPro
      ? 'Espace Professionnel'
      : isUser
        ? 'Espace Utilisateur'
        : '';

  const handleDeconnexion = async () => {
    await logout();
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('storage'));
    setCurrentRole(null);
    setSidebarOpen(false);
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Redirige vers connexion si non connecté, sinon exécute l'action normale
  const guardedNavigate = (to, onClick) => (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onClick?.();
      navigate('/connexion');
      return;
    }
    onClick?.();
  };

  // ─── Liens communs (mobile sidebar + bottom nav) — visibles pour TOUS ─────
  const commonLinks = (onClick, cls, activeCls) => (
    <>
      <Link to="/"           className={`${cls} ${isActive('/') ? activeCls : ''}`} onClick={onClick}><Home          className="w-4 h-4 shrink-0" /><span>Accueil</span></Link>
      <Link to="/apropos"    className={`${cls} ${isActive('/apropos') ? activeCls : ''}`} onClick={onClick}><Info          className="w-4 h-4 shrink-0" /><span>À propos</span></Link>
      <Link to="/ressources" className={`${cls} ${isActive('/ressources') ? activeCls : ''}`} onClick={onClick}><BookOpen      className="w-4 h-4 shrink-0" /><span>Ressources</span></Link>
      <Link to="/forum"      className={`${cls} ${isActive('/forum') ? activeCls : ''}`} onClick={onClick}><MessageCircle className="w-4 h-4 shrink-0" /><span>Forum</span></Link>
      <Link to="/chatbot"    className={`${cls} ${isActive('/chatbot') ? activeCls : ''}`} onClick={onClick}><Bot           className="w-4 h-4 shrink-0" /><span>PsyBotAI</span></Link>
      {/* Visible pour tout le monde — redirige vers connexion si non connecté */}
      <Link
        to={isAuthenticated ? "/reservation" : "/connexion"}
        className={`${cls} ${isActive('/reservation') ? activeCls : ''}`}
        onClick={guardedNavigate('/reservation', onClick)}
      >
        <CalendarCheck className="w-4 h-4 shrink-0" /><span>Nos Professionnels</span>
      </Link>
    </>
  );

  // ─── Liens d'authentification — uniquement si connecté ────────────────────
  const authLinks = (onClick, linkCls, redCls, yellowCls) => (
    <>
      {showMenu && (
        <>
          <Link to={espaceLink} className={linkCls} onClick={onClick}>
            <User className="w-4 h-4 shrink-0" /><span>{espaceLabel}</span>
          </Link>
          {isUser && !isPremium && (
            <Link to="/devenir-premium" className={yellowCls} onClick={onClick}>
              <Crown className="w-4 h-4 shrink-0" /><span>Devenir Premium</span>
            </Link>
          )}
          <span onClick={() => { handleDeconnexion(); onClick?.(); }} className={redCls}>
            <LogOut className="w-4 h-4 shrink-0" /><span>Déconnexion</span>
          </span>
        </>
      )}
      {!showMenu && currentRole && (
        <span onClick={() => { handleDeconnexion(); onClick?.(); }} className={redCls}>
          <LogOut className="w-4 h-4 shrink-0" /><span>Déconnexion</span>
        </span>
      )}
    </>
  );

  // Lien desktop avec soulignement animé au survol
  const NavLink = ({ to, icon: Icon, children, guarded }) => {
    const active = isActive(to);
    const target = guarded && !isAuthenticated ? '/connexion' : to;
    return (
      <Link
        to={target}
        className="relative group flex items-center gap-1.5 text-sm font-medium py-2"
      >
        <Icon className={`w-4 h-4 transition-colors ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
        <span className={`transition-colors ${active ? 'text-blue-600' : 'text-slate-600 group-hover:text-blue-600'}`}>
          {children}
        </span>
        <span
          className={`absolute -bottom-0.5 left-0 h-[2px] bg-blue-600 rounded-full transition-all duration-300
            ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}
        />
      </Link>
    );
  };

  return (
    <>
      {/* ════════════════════════════════════════
          DESKTOP (lg+)
      ════════════════════════════════════════ */}
      <header className="hidden lg:block bg-white/90 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-[68px]">

          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-md shadow-blue-600/20">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">PsyConnect</span>
          </Link>

          <nav className="flex items-center gap-7">
            <NavLink to="/" icon={Home}>Accueil</NavLink>
            <NavLink to="/apropos" icon={Info}>À propos</NavLink>
            <NavLink to="/ressources" icon={BookOpen}>Ressources</NavLink>
            <NavLink to="/forum" icon={MessageCircle}>Forum</NavLink>
            <NavLink to="/chatbot" icon={Bot}>PsyBotAI</NavLink>
            <NavLink to="/reservation" icon={CalendarCheck} guarded>Nos Professionnels</NavLink>

            {/* Séparateur visuel */}
            <div className="h-6 w-px bg-slate-200" />

            {/* Menu Mon Espace — connecté */}
            {showMenu && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  Mon Espace
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 shadow-xl rounded-2xl flex flex-col overflow-hidden z-50"
                    >
                      <Link
                        to={espaceLink}
                        className="px-4 py-3 hover:bg-blue-50 flex items-center gap-2.5 text-sm text-slate-700 font-medium transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-blue-500" /> {espaceLabel}
                      </Link>

                      {isUser && !isPremium && (
                        <Link
                          to="/devenir-premium"
                          className="px-4 py-3 hover:bg-amber-50 flex items-center gap-2.5 text-sm text-amber-600 font-medium transition"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Crown className="w-4 h-4" /> Devenir Premium
                        </Link>
                      )}

                      <div className="border-t border-slate-100" />

                      <button
                        onClick={() => { handleDeconnexion(); setUserMenuOpen(false); }}
                        className="px-4 py-3 hover:bg-red-50 flex items-center gap-2.5 text-sm text-red-500 font-medium w-full text-left transition"
                      >
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Déconnexion seule si rôle inconnu */}
            {!showMenu && currentRole && (
              <button onClick={handleDeconnexion} className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-semibold transition">
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            )}

            {/* Connexion / Inscription — non connecté */}
            {!currentRole && (
              <div className="relative" ref={authMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAuthMenuOpen(v => !v)}
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 transition"
                >
                  <User className="w-4 h-4" />
                  Connexion/Inscription
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${authMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {authMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl flex flex-col overflow-hidden z-50"
                    >
                      <Link
                        to="/connexion"
                        className="px-4 py-3 hover:bg-blue-50 flex items-center gap-2.5 text-sm text-slate-700 font-medium transition"
                        onClick={() => setAuthMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-blue-500" /> Connexion
                      </Link>
                      <Link
                        to="/inscription"
                        className="px-4 py-3 hover:bg-blue-50 flex items-center gap-2.5 text-sm text-slate-700 font-medium transition"
                        onClick={() => setAuthMenuOpen(false)}
                      >
                        <UserPlus className="w-4 h-4 text-blue-500" /> Inscription
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>
        </div>
      </header>
      <div className="hidden lg:block h-[68px]" />

      {/* ════════════════════════════════════════
          TABLETTE (md–lg)
      ════════════════════════════════════════ */}
      <header
        className="hidden md:flex lg:hidden bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 w-full z-50 shadow-sm border-b border-slate-100"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="w-full px-4 flex justify-between items-center h-[64px] min-w-0">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-md shadow-blue-600/20 shrink-0">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-800 truncate">PsyConnect</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-blue-50 transition text-blue-600 shrink-0"
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:block lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        ref={sidebarRef}
        style={{ top: 'calc(64px + env(safe-area-inset-top))', height: 'calc(100vh - 64px - env(safe-area-inset-top))' }}
        className={`hidden md:flex lg:hidden flex-col fixed left-0 w-64
          bg-white border-r border-slate-100 shadow-2xl z-50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-5 pt-5 pb-3 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Navigation</p>
        </div>
        <nav className="flex flex-col px-3 py-3 gap-0.5 flex-1 overflow-y-auto">
          {commonLinks(
            () => setSidebarOpen(false),
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition font-medium text-sm",
            "bg-blue-50 text-blue-600"
          )}
          {(showMenu || currentRole) && <div className="border-t border-slate-100 my-2" />}
          {authLinks(
            () => setSidebarOpen(false),
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-600 hover:bg-blue-50 transition font-medium text-sm cursor-pointer",
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition font-medium text-sm cursor-pointer",
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-600 hover:bg-amber-50 transition font-medium text-sm cursor-pointer"
          )}
          {!currentRole && (
            <>
              <div className="border-t border-slate-100 my-2" />
              <Link to="/connexion"   className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-600 hover:bg-blue-50 transition font-medium text-sm" onClick={() => setSidebarOpen(false)}>
                <User className="w-4 h-4" /><span>Connexion</span>
              </Link>
              <Link to="/inscription" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-medium text-sm shadow-md shadow-blue-600/20" onClick={() => setSidebarOpen(false)}>
                <UserPlus className="w-4 h-4" /><span>Inscription</span>
              </Link>
            </>
          )}
        </nav>
        <button
          onClick={() => setSidebarOpen(false)}
          className="flex items-center justify-center gap-2 mx-3 mb-4 py-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs transition shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" /> Réduire
        </button>
      </aside>
      <div className="hidden md:block lg:hidden" style={{ height: 'calc(64px + env(safe-area-inset-top))' }} />

      {/* ════════════════════════════════════════
          MOBILE (< md)
      ════════════════════════════════════════ */}
      <header
        className="flex md:hidden bg-white/95 backdrop-blur-md fixed top-0 left-0 right-0 w-full z-50 shadow-sm border-b border-slate-100"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="w-full px-3 flex justify-center items-center h-[52px] min-w-0">
          <Link to="/" className="flex items-center gap-2 min-w-0 max-w-full">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 shadow-sm shrink-0">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-slate-800 truncate">PsyConnect</span>
          </Link>
        </div>
      </header>
      {/* Spacer qui compense exactement la hauteur réelle du header (safe-area incluse) */}
      <div className="flex md:hidden" style={{ height: 'calc(52px + env(safe-area-inset-top))' }} />

      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex w-full">
          {[
            { to: '/', icon: Home, label: 'Accueil' },
            { to: '/apropos', icon: Info, label: 'À propos' },
            { to: '/ressources', icon: BookOpen, label: 'Ressources' },
            { to: '/forum', icon: MessageCircle, label: 'Forum' },
            { to: '/chatbot', icon: Bot, label: 'PsyBotAI' },
          ].map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 gap-0.5 transition
                  ${active ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
              >
                <div className={`flex items-center justify-center rounded-lg px-2 py-0.5 ${active ? 'bg-blue-50' : ''}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[9px] leading-tight font-medium truncate max-w-full px-0.5">{label}</span>
              </Link>
            );
          })}
          <Link
            to={isAuthenticated ? "/reservation" : "/connexion"}
            onClick={guardedNavigate('/reservation')}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 gap-0.5 transition
              ${isActive('/reservation') ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
          >
            <div className={`flex items-center justify-center rounded-lg px-2 py-0.5 ${isActive('/reservation') ? 'bg-blue-50' : ''}`}>
              <CalendarCheck className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[9px] leading-tight font-medium truncate max-w-full px-0.5">Pros</span>
          </Link>
          {showMenu ? (
            <Link
              to={espaceLink}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 gap-0.5 transition
                ${isActive(espaceLink) ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
            >
              <div className={`flex items-center justify-center rounded-lg px-2 py-0.5 ${isActive(espaceLink) ? 'bg-blue-50' : ''}`}>
                <User className="w-5 h-5 shrink-0" />
              </div>
              <span className="text-[9px] leading-tight font-medium truncate max-w-full px-0.5">Espace</span>
            </Link>
          ) : (
            <Link
              to="/connexion"
              className="flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 text-slate-400 hover:text-blue-500 gap-0.5 transition"
            >
              <User className="w-5 h-5 shrink-0" />
              <span className="text-[9px] leading-tight font-medium truncate max-w-full px-0.5">Connexion</span>
            </Link>
          )}
        </div>
      </nav>
      {/* Spacer bottom nav — compense hauteur réelle + safe area */}
      <div className="flex md:hidden" style={{ height: 'calc(56px + env(safe-area-inset-bottom))' }} />
    </>
  );
};

export default Header;