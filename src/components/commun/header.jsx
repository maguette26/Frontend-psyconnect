import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../services/serviceAuth';
import {
  HeartPulse, Home, Info, BookOpen, MessageCircle,
  Bot, User, CalendarCheck, Crown, LogOut, ChevronRight,
  Settings, Menu, X
} from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRole, setCurrentRole] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const updateRole = () => setCurrentRole(localStorage.getItem('role'));
    updateRole();
    window.addEventListener('roleChange', updateRole);
    window.addEventListener('storage', updateRole);
    return () => {
      window.removeEventListener('roleChange', updateRole);
      window.removeEventListener('storage', updateRole);
    };
  }, []);

  // Fermer sidebar quand on change de page
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isUser = currentRole === "UTILISATEUR";
  const isPro = ["PSYCHIATRE", "PSYCHOLOGUE"].includes(currentRole);
  const isAdmin = currentRole === "ADMIN";
  const isPremiumUser = (role) => ['PREMIUM', 'ADMIN'].includes(role);
  const showMenu = isUser || isPro || isAdmin;

  const espaceLink =
    isUser ? "/tableauUtilisateur" :
    isPro ? "/tableauProfessionnel" :
    "/tableauAdmin";

  const espaceLabel =
    isUser ? "Mon espace" :
    isPro ? "Espace Pro" :
    "Admin";

  const handleDeconnexion = async () => {
    await logout();
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.dispatchEvent(new Event("storage"));
    setCurrentRole(null);
    setSidebarOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  // Liens bottom bar mobile (5 max)
  const bottomLinks = [
    { to: "/", icon: Home, label: "Accueil" },
    { to: "/forum", icon: MessageCircle, label: "Forum" },
    ...(isUser ? [{ to: "/reservation", icon: CalendarCheck, label: "Réserver" }] : []),
    { to: "/ressources", icon: BookOpen, label: "Ressources" },
    { to: "/chatbot", icon: Bot, label: "PsyBot" },
  ].slice(0, 4);

  // Tous les liens pour la sidebar tablette
  const allLinks = [
    { to: "/", icon: Home, label: "Accueil" },
    { to: "/apropos", icon: Info, label: "À propos" },
    { to: "/ressources", icon: BookOpen, label: "Ressources" },
    { to: "/forum", icon: MessageCircle, label: "Forum" },
    { to: "/chatbot", icon: Bot, label: "PsyBotAI" },
    ...(isUser ? [{ to: "/reservation", icon: CalendarCheck, label: "Nos Professionnels" }] : []),
    ...(showMenu ? [{ to: espaceLink, icon: User, label: espaceLabel }] : []),
    ...(isUser && !isPremiumUser(currentRole) ? [{ to: "/devenir-premium", icon: Crown, label: "Devenir Premium", yellow: true }] : []),
  ];

  return (
    <>
      {/* ─── HEADER DESKTOP (lg+) ─── */}
      <header className="hidden lg:flex bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center h-[70px] w-full">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600 hover:text-indigo-700">
            <HeartPulse className="w-5 h-5" /> PsyConnect
          </Link>

          <nav className="flex items-center gap-5">
            {[
              { to: "/", icon: Home, label: "Accueil" },
              { to: "/apropos", icon: Info, label: "À propos" },
              { to: "/ressources", icon: BookOpen, label: "Ressources" },
              { to: "/forum", icon: MessageCircle, label: "Forum" },
              { to: "/chatbot", icon: Bot, label: "PsyBotAI" },
            ].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1 text-sm font-medium transition
                  ${isActive(to) ? 'text-indigo-800 border-b-2 border-indigo-600 pb-0.5' : 'text-indigo-600 hover:text-indigo-800'}`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}

            {isUser && (
              <Link to="/reservation"
                className={`flex items-center gap-1 text-sm font-medium transition
                  ${isActive('/reservation') ? 'text-indigo-800 border-b-2 border-indigo-600 pb-0.5' : 'text-indigo-600 hover:text-indigo-800'}`}>
                <CalendarCheck className="w-4 h-4" /> Nos Professionnels
              </Link>
            )}

            {showMenu && (
              <Link to={espaceLink}
                className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition">
                <User className="w-4 h-4" /> {espaceLabel}
              </Link>
            )}

            {isUser && !isPremiumUser(currentRole) && (
              <Link to="/devenir-premium" className="flex items-center gap-1 text-sm font-medium text-yellow-600 hover:text-yellow-700 transition">
                <Crown className="w-4 h-4" /> Premium
              </Link>
            )}

            {currentRole && (
              <span onClick={handleDeconnexion}
                className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 cursor-pointer transition">
                <LogOut className="w-4 h-4" /> Déconnexion
              </span>
            )}

            {!currentRole && (
              <div className="flex items-center gap-2">
                <Link to="/connexion" className="text-sm font-medium text-indigo-600 border border-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                  Connexion
                </Link>
                <Link to="/inscription" className="text-sm font-medium text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                  Inscription
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* ─── HEADER TABLETTE (md) avec sidebar ─── */}
      <header className="hidden md:flex lg:hidden bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 flex justify-between items-center h-[70px] w-full">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <HeartPulse className="w-5 h-5" /> PsyConnect
          </Link>
          <button onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sidebar tablette */}
      {sidebarOpen && (
        <div className="hidden md:block lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />

          {/* Panneau */}
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            {/* En-tête sidebar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
                <HeartPulse className="w-5 h-5" /> PsyConnect
              </Link>
              <button onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Liens */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {allLinks.map(({ to, icon: Icon, label, yellow }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition font-medium text-sm
                    ${isActive(to) ? 'bg-indigo-50 text-indigo-700' : yellow ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                  {label}
                  {isActive(to) && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />}
                </Link>
              ))}
            </nav>

            {/* Bas sidebar */}
            <div className="px-3 py-4 border-t border-gray-100 space-y-1">
              {currentRole && (
                <button onClick={handleDeconnexion}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition font-medium text-sm">
                  <LogOut className="w-5 h-5" /> Déconnexion
                </button>
              )}
              {!currentRole && (
                <div className="flex flex-col gap-2">
                  <Link to="/connexion" onClick={() => setSidebarOpen(false)}
                    className="text-center text-sm font-medium text-indigo-600 border border-indigo-300 px-3 py-2 rounded-xl hover:bg-indigo-50 transition">
                    Connexion
                  </Link>
                  <Link to="/inscription" onClick={() => setSidebarOpen(false)}
                    className="text-center text-sm font-medium text-white bg-indigo-600 px-3 py-2 rounded-xl hover:bg-indigo-700 transition">
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── BOTTOM BAR MOBILE (< md) ─── */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 flex justify-between items-center h-[60px]">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
            <HeartPulse className="w-5 h-5" /> PsyConnect
          </Link>
          {!currentRole && (
            <div className="flex items-center gap-2">
              <Link to="/connexion" className="text-xs font-medium text-indigo-600 border border-indigo-300 px-2.5 py-1.5 rounded-lg">
                Connexion
              </Link>
              <Link to="/inscription" className="text-xs font-medium text-white bg-indigo-600 px-2.5 py-1.5 rounded-lg">
                Inscription
              </Link>
            </div>
          )}
          {currentRole && (
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {espaceLabel}
            </span>
          )}
        </div>
      </header>

      {/* Bottom navigation bar mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition min-w-0
                ${isActive(to) ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'}`}>
              <div className={`p-1.5 rounded-xl transition ${isActive(to) ? 'bg-indigo-50' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          ))}

          {/* Bouton Profil */}
          <Link to={showMenu ? espaceLink : currentRole ? espaceLink : "/connexion"}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition
              ${isActive(espaceLink) ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'}`}>
            <div className={`p-1.5 rounded-xl transition ${isActive(espaceLink) ? 'bg-indigo-50' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        </div>
      </nav>

      {/* Spacers */}
      <div className="hidden lg:block pt-[70px]" />
      <div className="hidden md:block lg:hidden pt-[70px]" />
      <div className="md:hidden pt-[60px]" />

      {/* Espace pour la bottom bar mobile */}
      <div className="md:hidden pb-[65px]" />
    </>
  );
};

export default Header;