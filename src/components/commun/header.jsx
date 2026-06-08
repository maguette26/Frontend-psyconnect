import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../services/serviceAuth';
import {
  HeartPulse, Home, Info, BookOpen, MessageCircle,
  Bot, User, CalendarCheck, Crown, LogOut, ChevronDown, Menu, X
} from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const updateRole = () => setCurrentRole(localStorage.getItem('role'));
    updateRole();
    window.addEventListener('roleChange', updateRole);
    return () => window.removeEventListener('roleChange', updateRole);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => setCurrentRole(localStorage.getItem('role'));
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isUser = currentRole === "UTILISATEUR";
  const isPro = ["PSYCHIATRE", "PSYCHOLOGUE"].includes(currentRole);
  const isAdmin = currentRole === "ADMIN";
  const isPremiumUser = (role) => ['PREMIUM', 'ADMIN'].includes(role);
  const showMenu = isUser || isPro || isAdmin;

  const handleDeconnexion = async () => {
    await logout();
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.dispatchEvent(new Event("storage"));
    setCurrentRole(null);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const baseLinkClass = "flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition font-medium text-sm";
  const mobileLinkClass = "flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-lg transition font-medium text-base";

  const espaceLink =
    isUser ? "/tableauUtilisateur" :
    isPro ? "/tableauProfessionnel" :
    "/tableauAdmin";

  const espaceLabel =
    isUser ? "Espace Utilisateur" :
    isPro ? "Espace Professionnel" :
    "Espace Admin";

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center h-[70px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 shrink-0">
            <HeartPulse className="w-5 h-5" /> PsyConnect
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-5">
            <Link to="/" className={baseLinkClass}><Home className="w-4 h-4" /> Accueil</Link>
            <Link to="/apropos" className={baseLinkClass}><Info className="w-4 h-4" /> À propos</Link>
            <Link to="/ressources" className={baseLinkClass}><BookOpen className="w-4 h-4" /> Ressources</Link>
            <Link to="/forum" className={baseLinkClass}><MessageCircle className="w-4 h-4" /> Forum</Link>
            <Link to="/chatbot" className={baseLinkClass}><Bot className="w-4 h-4" /> PsyBotAI</Link>

            {isUser && (
              <Link to="/reservation" className={baseLinkClass}>
                <CalendarCheck className="w-4 h-4" /> Nos Professionnels
              </Link>
            )}

            {showMenu && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition font-medium text-sm"
                >
                  <User className="w-4 h-4" /> Mon Espace
                  <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md flex flex-col z-50
                  transition-all duration-200 transform origin-top-right
                  ${userMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  <Link to={espaceLink} className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm" onClick={() => setUserMenuOpen(false)}>
                    <User className="w-4 h-4" /> {espaceLabel}
                  </Link>
                  {isUser && !isPremiumUser(currentRole) && (
                    <Link to="/devenir-premium" className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-yellow-600 text-sm" onClick={() => setUserMenuOpen(false)}>
                      <Crown className="w-4 h-4" /> Devenir Premium
                    </Link>
                  )}
                  <span onClick={() => { handleDeconnexion(); setUserMenuOpen(false); }}
                    className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-500 cursor-pointer text-sm">
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </span>
                </div>
              </div>
            )}

            {!showMenu && currentRole && (
              <span onClick={handleDeconnexion} className="flex items-center gap-1 text-red-500 hover:text-red-600 cursor-pointer text-sm">
                <LogOut className="w-4 h-4" /> Déconnexion
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

          {/* Bouton hamburger mobile */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-indigo-50 transition text-indigo-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu mobile déroulant */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100
          ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="flex flex-col px-4 py-3 gap-1">
            <Link to="/" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}><Home className="w-4 h-4" /> Accueil</Link>
            <Link to="/apropos" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}><Info className="w-4 h-4" /> À propos</Link>
            <Link to="/ressources" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}><BookOpen className="w-4 h-4" /> Ressources</Link>
            <Link to="/forum" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}><MessageCircle className="w-4 h-4" /> Forum</Link>
            <Link to="/chatbot" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}><Bot className="w-4 h-4" /> PsyBotAI</Link>

            {isUser && (
              <Link to="/reservation" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                <CalendarCheck className="w-4 h-4" /> Nos Professionnels
              </Link>
            )}

            {showMenu && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <Link to={espaceLink} className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  <User className="w-4 h-4" /> {espaceLabel}
                </Link>
                {isUser && !isPremiumUser(currentRole) && (
                  <Link to="/devenir-premium" className={`${mobileLinkClass} text-yellow-600`} onClick={() => setMobileMenuOpen(false)}>
                    <Crown className="w-4 h-4" /> Devenir Premium
                  </Link>
                )}
                <span onClick={handleDeconnexion} className={`${mobileLinkClass} text-red-500 cursor-pointer`}>
                  <LogOut className="w-4 h-4" /> Déconnexion
                </span>
              </>
            )}

            {!showMenu && currentRole && (
              <span onClick={handleDeconnexion} className={`${mobileLinkClass} text-red-500 cursor-pointer`}>
                <LogOut className="w-4 h-4" /> Déconnexion
              </span>
            )}

            {!currentRole && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <Link to="/connexion" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  <User className="w-4 h-4" /> Connexion
                </Link>
                <Link to="/inscription" className={`${mobileLinkClass} text-indigo-700 font-semibold`} onClick={() => setMobileMenuOpen(false)}>
                  <User className="w-4 h-4" /> Inscription
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="pt-[70px]" />
    </>
  );
};

export default Header;