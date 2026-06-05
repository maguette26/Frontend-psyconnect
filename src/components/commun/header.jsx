import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../services/serviceAuth';
import {
  HeartPulse,
  Home,
  Info,
  BookOpen,
  MessageCircle,
  Bot,
  User,
  CalendarCheck,
  Crown,
  LogOut,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
const [currentRole, setCurrentRole] = useState(null);

useEffect(() => {
  const updateRole = () => {
    setCurrentRole(localStorage.getItem('role'));
  };

  updateRole(); // important au mount

  window.addEventListener('roleChange', updateRole);

  return () => window.removeEventListener('roleChange', updateRole);
}, []);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isUser = currentRole === "UTILISATEUR";
  const isPro = ["PSYCHIATRE", "PSYCHOLOGUE"].includes(currentRole);
  const isAdmin = currentRole === "ADMIN";
  const isPremiumUser = (role) => ['PREMIUM', 'ADMIN'].includes(role);

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentRole(localStorage.getItem('role'));
    };
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

  const handleDeconnexion = async () => {
    await logout();

    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    window.dispatchEvent(new Event("storage"));

    setCurrentRole(null);
    navigate("/");
  };

  const baseLinkClass =
    "flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition font-medium";

  const showMenu = isUser || isPro || isAdmin;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center h-[70px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-600 hover:text-indigo-700">
            <HeartPulse className="w-6 h-6" /> PsyConnect
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">

            <Link to="/" className={baseLinkClass}><Home className="w-4 h-4" /> Accueil</Link>
            <Link to="/apropos" className={baseLinkClass}><Info className="w-4 h-4" /> À propos</Link>
            <Link to="/ressources" className={baseLinkClass}><BookOpen className="w-4 h-4" /> Ressources</Link>
            <Link to="/forum" className={baseLinkClass}><MessageCircle className="w-4 h-4" /> Forum</Link>
            <Link to="/chatbot" className={baseLinkClass}><Bot className="w-4 h-4" /> PsyBotAI</Link>

            {/* UTILISATEUR : réservation */}
            {isUser && (
              <Link to="/reservation" className={baseLinkClass}>
                <CalendarCheck className="w-4 h-4" /> Nos Professionnels
              </Link>
            )}

            {/* MENU ESPACE (USER + PRO + ADMIN) */}
            {showMenu && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition font-medium"
                >
                  <User className="w-4 h-4" /> Mon Espace
                  <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md flex flex-col z-50
                  transition-all duration-200 transform origin-top-right
                  ${userMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>

                  <Link
                    to={
                      isUser ? "/tableauUtilisateur" :
                      isPro ? "/tableauProfessionnel" :
                      "/tableauAdmin"
                    }
                    className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {isUser ? "Espace Utilisateur" :
                     isPro ? "Espace Professionnel" :
                     "Espace Admin"}
                  </Link>

                  {isUser && !isPremiumUser(currentRole) && (
                    <Link
                      to="/devenir-premium"
                      className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-yellow-600"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Crown className="w-4 h-4" /> Devenir Premium
                    </Link>
                  )}

                  <span
                    onClick={() => {
                      handleDeconnexion();
                      setUserMenuOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-500 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </span>
                </div>
              </div>
            )}

            {/* Déconnexion direct pour roles sans menu */}
            {!showMenu && currentRole && (
              <span
                onClick={handleDeconnexion}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Déconnexion
              </span>
            )}

            {/* Non connecté */}
            {!currentRole && (
              <select
                onChange={(e) => {
                  if (e.target.value === 'connexion') navigate('/connexion');
                  else if (e.target.value === 'inscription') navigate('/inscription');
                }}
                defaultValue=""
                className="text-indigo-600 border border-indigo-600 rounded px-2 py-1 cursor-pointer bg-white"
              >
                <option value="" disabled>👤 Connex/Insc</option>
                <option value="connexion">Connexion</option>
                <option value="inscription">Inscription</option>
              </select>
            )}

          </div>
        </div>
      </header>

      <div className="pt-[70px]" />
    </>
  );
};

export default Header;