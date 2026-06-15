import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../services/serviceAuth';
import {
  HeartPulse, Home, Info, BookOpen, MessageCircle,
  Bot, User, CalendarCheck, Crown, LogOut, ChevronDown,
  ChevronRight, Menu, X
} from 'lucide-react';

// ─── Helper : lit le rôle depuis currentUserInfo (source unique de vérité) ───
const getRoleFromStorage = () => {
  try {
    const str = localStorage.getItem('currentUserInfo');
    if (str) {
      const info = JSON.parse(str);
      return info?.role ?? null;
    }
  } catch {
    // JSON corrompu
  }
  return null;
};

const Header = () => {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(() => getRoleFromStorage());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);

  // ─── Synchronisation du rôle ─────────────────────────────────────────────
  useEffect(() => {
    const sync = () => setCurrentRole(getRoleFromStorage());

    // 'roleChange' → même onglet (post-login, post-paiement)
    window.addEventListener('roleChange', sync);
    // 'storage'    → autres onglets
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('roleChange', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // ─── Fermeture menus au clic extérieur ───────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Dérivés du rôle ─────────────────────────────────────────────────────
  const isUser      = currentRole === 'UTILISATEUR';
  const isPro       = ['PSYCHIATRE', 'PSYCHOLOGUE'].includes(currentRole);
  const isAdmin     = currentRole === 'ADMIN';
  const isPremium   = ['PREMIUM', 'ADMIN'].includes(currentRole);
  const showMenu    = isUser || isPro || isAdmin || isPremium;

  const espaceLink  = isUser || isPremium ? '/tableauUtilisateur'
                    : isPro               ? '/tableauProfessionnel'
                    :                       '/tableauAdmin';

  const espaceLabel = isUser || isPremium ? 'Espace Utilisateur'
                    : isPro               ? 'Espace Professionnel'
                    :                       'Espace Admin';

  // ─── Déconnexion ─────────────────────────────────────────────────────────
  const handleDeconnexion = async () => {
    await logout(); // efface currentUserInfo + token
    setCurrentRole(null);
    setSidebarOpen(false);
    window.dispatchEvent(new Event('roleChange'));
    navigate('/');
  };

  // ─── Liens réutilisables ─────────────────────────────────────────────────
  const commonLinks = (onClick, cls) => (
    <>
      <Link to="/"          className={cls} onClick={onClick}><Home        className="w-4 h-4 shrink-0"/><span>Accueil</span></Link>
      <Link to="/apropos"   className={cls} onClick={onClick}><Info        className="w-4 h-4 shrink-0"/><span>À propos</span></Link>
      <Link to="/ressources"className={cls} onClick={onClick}><BookOpen    className="w-4 h-4 shrink-0"/><span>Ressources</span></Link>
      <Link to="/forum"     className={cls} onClick={onClick}><MessageCircle className="w-4 h-4 shrink-0"/><span>Forum</span></Link>
      <Link to="/chatbot"   className={cls} onClick={onClick}><Bot         className="w-4 h-4 shrink-0"/><span>PsyBotAI</span></Link>
      {(isUser || isPremium) && (
        <Link to="/reservation" className={cls} onClick={onClick}><CalendarCheck className="w-4 h-4 shrink-0"/><span>Nos Professionnels</span></Link>
      )}
    </>
  );

  const authLinks = (onClick, linkCls, redCls, yellowCls) => (
    <>
      {showMenu && (
        <>
          <Link to={espaceLink} className={linkCls} onClick={onClick}>
            <User className="w-4 h-4 shrink-0"/><span>{espaceLabel}</span>
          </Link>

          {/* Bouton Premium uniquement si UTILISATEUR non-premium */}
          {isUser && !isPremium && (
            <Link to="/devenir-premium" className={yellowCls} onClick={onClick}>
              <Crown className="w-4 h-4 shrink-0"/><span>Devenir Premium</span>
            </Link>
          )}

          <span onClick={() => { handleDeconnexion(); onClick?.(); }} className={redCls}>
            <LogOut className="w-4 h-4 shrink-0"/><span>Déconnexion</span>
          </span>
        </>
      )}
      {!showMenu && currentRole && (
        <span onClick={() => { handleDeconnexion(); onClick?.(); }} className={redCls}>
          <LogOut className="w-4 h-4 shrink-0"/><span>Déconnexion</span>
        </span>
      )}
    </>
  );

  const desktopLink = "flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition font-medium text-sm";

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP (lg+)
      ══════════════════════════════════════════ */}
      <header className="hidden lg:block bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center h-[70px]">

          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 shrink-0">
            <HeartPulse className="w-5 h-5"/> PsyConnect
          </Link>

          <nav className="flex items-center gap-5">
            <Link to="/"           className={desktopLink}><Home          className="w-4 h-4"/> Accueil</Link>
            <Link to="/apropos"    className={desktopLink}><Info          className="w-4 h-4"/> À propos</Link>
            <Link to="/ressources" className={desktopLink}><BookOpen      className="w-4 h-4"/> Ressources</Link>
            <Link to="/forum"      className={desktopLink}><MessageCircle className="w-4 h-4"/> Forum</Link>
            <Link to="/chatbot"    className={desktopLink}><Bot           className="w-4 h-4"/> PsyBotAI</Link>

            {(isUser || isPremium) && (
              <Link to="/reservation" className={desktopLink}>
                <CalendarCheck className="w-4 h-4"/> Nos Professionnels
              </Link>
            )}

            {showMenu && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition font-medium text-sm"
                >
                  <User className="w-4 h-4"/> Mon Espace
                  <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}/>
                </button>

                <div className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md flex flex-col z-50
                  transition-all duration-200 transform origin-top-right
                  ${userMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>

                  <Link to={espaceLink} className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm" onClick={() => setUserMenuOpen(false)}>
                    <User className="w-4 h-4"/> {espaceLabel}
                  </Link>

                  {isUser && !isPremium && (
                    <Link to="/devenir-premium" className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-yellow-600 text-sm" onClick={() => setUserMenuOpen(false)}>
                      <Crown className="w-4 h-4"/> Devenir Premium
                    </Link>
                  )}

                  <span
                    onClick={() => { handleDeconnexion(); setUserMenuOpen(false); }}
                    className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-500 cursor-pointer text-sm"
                  >
                    <LogOut className="w-4 h-4"/> Déconnexion
                  </span>
                </div>
              </div>
            )}

            {!showMenu && currentRole && (
              <span onClick={handleDeconnexion} className="flex items-center gap-1 text-red-500 hover:text-red-600 cursor-pointer text-sm">
                <LogOut className="w-4 h-4"/> Déconnexion
              </span>
            )}

            {!currentRole && (
              <select
                onChange={(e) => {
                  if (e.target.value === 'connexion') navigate('/connexion');
                  else if (e.target.value === 'inscription') navigate('/inscription');
                }}
                defaultValue=""
                className="text-indigo-600 border border-indigo-600 rounded px-2 py-1 cursor-pointer bg-white text-sm"
              >
                <option value="" disabled>👤 Connexion</option>
                <option value="connexion">Connexion</option>
                <option value="inscription">Inscription</option>
              </select>
            )}
          </nav>
        </div>
      </header>
      <div className="hidden lg:block pt-[70px]"/>


      {/* ══════════════════════════════════════════
          TABLETTE (md–lg) — Header + Sidebar
      ══════════════════════════════════════════ */}
      <header className="hidden md:flex lg:hidden bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm border-b border-gray-200">
        <div className="w-full px-4 py-3 flex justify-between items-center h-[64px]">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
            <HeartPulse className="w-5 h-5"/> PsyConnect
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-indigo-50 transition text-indigo-600"
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="hidden md:block lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`hidden md:flex lg:hidden flex-col fixed top-[64px] left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 shadow-xl z-50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Navigation</p>
        </div>

        <nav className="flex flex-col px-3 py-3 gap-0.5 flex-1 overflow-y-auto">
          {commonLinks(() => setSidebarOpen(false),
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-indigo-700 hover:bg-indigo-50 transition font-medium text-sm"
          )}

          {(showMenu || currentRole) && <div className="border-t border-gray-100 my-2"/>}

          {authLinks(
            () => setSidebarOpen(false),
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-indigo-700 hover:bg-indigo-50 transition font-medium text-sm cursor-pointer",
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition font-medium text-sm cursor-pointer",
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-yellow-600 hover:bg-yellow-50 transition font-medium text-sm cursor-pointer"
          )}

          {!currentRole && (
            <>
              <div className="border-t border-gray-100 my-2"/>
              <Link to="/connexion"  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-indigo-700 hover:bg-indigo-50 transition font-medium text-sm" onClick={() => setSidebarOpen(false)}>
                <User className="w-4 h-4"/><span>Connexion</span>
              </Link>
              <Link to="/inscription" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium text-sm" onClick={() => setSidebarOpen(false)}>
                <User className="w-4 h-4"/><span>Inscription</span>
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={() => setSidebarOpen(false)}
          className="flex items-center justify-center gap-2 mx-3 mb-4 py-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 text-xs transition"
        >
          <ChevronRight className="w-3.5 h-3.5"/> Réduire
        </button>
      </aside>

      <div className="hidden md:block lg:hidden pt-[64px]"/>


      {/* ══════════════════════════════════════════
          MOBILE (< md) — Logo haut + Nav bas
      ══════════════════════════════════════════ */}
      <header className="flex md:hidden bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm border-b border-gray-200">
        <div className="w-full px-4 py-3 flex justify-center items-center h-[56px]">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
            <HeartPulse className="w-5 h-5"/> PsyConnect
          </Link>
        </div>
      </header>

      <div className="flex md:hidden pt-[56px]"/>

      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex w-full">
          <Link to="/" className="flex flex-col items-center justify-center flex-1 py-2 text-indigo-600 hover:bg-indigo-50 transition gap-0.5">
            <Home className="w-5 h-5"/><span className="text-[10px] font-medium">Accueil</span>
          </Link>
          <Link to="/apropos" className="flex flex-col items-center justify-center flex-1 py-2 text-indigo-600 hover:bg-indigo-50 transition gap-0.5">
            <Info className="w-5 h-5"/><span className="text-[10px] font-medium">À propos</span>
          </Link>
          <Link to="/ressources" className="flex flex-col items-center justify-center flex-1 py-2 text-indigo-600 hover:bg-indigo-50 transition gap-0.5">
            <BookOpen className="w-5 h-5"/><span className="text-[10px] font-medium">Ressources</span>
          </Link>
          <Link to="/forum" className="flex flex-col items-center justify-center flex-1 py-2 text-indigo-600 hover:bg-indigo-50 transition gap-0.5">
            <MessageCircle className="w-5 h-5"/><span className="text-[10px] font-medium">Forum</span>
          </Link>
          <Link to="/chatbot" className="flex flex-col items-center justify-center flex-1 py-2 text-indigo-600 hover:bg-indigo-50 transition gap-0.5">
            <Bot className="w-5 h-5"/><span className="text-[10px] font-medium">PsyBotAI</span>
          </Link>

          {(isUser || isPremium) && (
            <Link to="/reservation" className="flex flex-col items-center justify-center flex-1 py-2 text-indigo-600 hover:bg-indigo-50 transition gap-0.5">
              <CalendarCheck className="w-5 h-5"/><span className="text-[10px] font-medium">Pros</span>
            </Link>
          )}

          {showMenu ? (
            <Link to={espaceLink} className="flex flex-col items-center justify-center flex-1 py-2 text-indigo-600 hover:bg-indigo-50 transition gap-0.5">
              <User className="w-5 h-5"/><span className="text-[10px] font-medium">Espace</span>
            </Link>
          ) : currentRole ? (
            <button onClick={handleDeconnexion} className="flex flex-col items-center justify-center flex-1 py-2 text-red-500 hover:bg-red-50 transition gap-0.5">
              <LogOut className="w-5 h-5"/><span className="text-[10px] font-medium">Déco.</span>
            </button>
          ) : (
            <Link to="/connexion" className="flex flex-col items-center justify-center flex-1 py-2 text-indigo-600 hover:bg-indigo-50 transition gap-0.5">
              <User className="w-5 h-5"/><span className="text-[10px] font-medium">Connexion</span>
            </Link>
          )}
        </div>
      </nav>

      <div className="flex md:hidden pb-[60px]"/>
    </>
  );
};

export default Header;