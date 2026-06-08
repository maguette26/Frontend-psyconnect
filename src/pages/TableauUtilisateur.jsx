import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/commun/Layout';
import SuiviHumeur from '../components/utilisateur/SuiviHumeur';
import Consultations from '../components/utilisateur/MesConsultations';
import { getCurrentUserInfo } from '../services/serviceAuth';
import FormulaireProfil from '../components/utilisateur/FormulaireProfil';
import MesReservations from '../components/utilisateur/MesReservations';
import {
  CalendarDays, UserCheck, Smile, User, XCircle,
  ChevronsLeft, ChevronsRight, Moon, Sun, LogOut
} from 'lucide-react';

/* ─────────────────────────────────────────
   NavItem — réutilisé sidebar + bottom bar
───────────────────────────────────────── */
const NavItem = ({ icon, label, active, onClick, reduced }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
      ${active ? 'bg-blue-900 dark:bg-blue-700 font-semibold' : 'hover:bg-blue-700 dark:hover:bg-blue-800'}
      ${reduced ? 'justify-center' : ''}`}
  >
    {icon}
    {!reduced && <span className="truncate">{label}</span>}
  </button>
);

const TABS = [
  { key: 'reservations',  label: 'Réservations',  icon: <UserCheck  size={20} /> },
  { key: 'consultations', label: 'Consultations', icon: <CalendarDays size={20} /> },
  { key: 'humeur',        label: 'Humeur',         icon: <Smile      size={20} /> },
  { key: 'profil',        label: 'Profil',          icon: <User       size={20} /> },
];

/* ─────────────────────────────────────────
   Composant principal
───────────────────────────────────────── */
const TableauUtilisateur = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser]         = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [globalError, setGlobalError]         = useState(null);
  const [activeTab, setActiveTab]             = useState('reservations');
  const [sidebarReduced, setSidebarReduced]   = useState(false);
  const [darkMode, setDarkMode]               = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true'
  );

  /* dark mode */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  /* chargement user */
  useEffect(() => {
    const user = getCurrentUserInfo();
    if (user?.id && user.role === 'USER') {
      setCurrentUser(user);
    } else {
      setGlobalError('Accès refusé.');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  /* ── sections ── */
  const renderSection = () => {
    switch (activeTab) {
      case 'reservations':  return <MesReservations onError={setGlobalError} />;
      case 'consultations': return <Consultations />;
      case 'humeur':        return <SuiviHumeur currentUser={currentUser} />;
      case 'profil':
        return (
          <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <User size={24} /> Mes infos personnelles
            </h2>
            <FormulaireProfil />
          </div>
        );
      default: return null;
    }
  };

  if (loading) return <Layout><div className="text-center p-8 text-blue-600">Chargement...</div></Layout>;
  if (globalError && !currentUser) return <Layout><div className="p-6 text-red-600">{globalError}</div></Layout>;

  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

        {/* ══════════════════════════════════════
            SIDEBAR — desktop uniquement (md+)
        ══════════════════════════════════════ */}
        <nav
          className={`hidden md:flex flex-col justify-between bg-gradient-to-b from-blue-800 to-blue-600
            text-white shadow-lg shrink-0 transition-all duration-300 ease-in-out
            ${sidebarReduced ? 'w-20' : 'w-64'}`}
        >
          {/* Avatar + nom */}
          <div className="flex flex-col items-center p-4 border-b border-blue-500 space-y-1">
            {currentUser?.photoUrl ? (
              <img src={currentUser.photoUrl} alt="user" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-xl font-bold">
                {currentUser?.prenom?.[0] || 'U'}
              </div>
            )}
            {!sidebarReduced && (
              <>
                <p className="font-semibold text-base leading-tight text-center">
                  {currentUser?.prenom} {currentUser?.nom}
                </p>
                <span className="text-blue-300 text-xs">Utilisateur</span>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-grow mt-2 space-y-1 px-2">
            {TABS.map(({ key, label, icon }) => (
              <NavItem
                key={key}
                icon={icon}
                label={label}
                active={activeTab === key}
                onClick={() => setActiveTab(key)}
                reduced={sidebarReduced}
              />
            ))}
          </div>

          {/* Dark mode */}
          <div className="px-2 mt-2">
            {!sidebarReduced ? (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 text-blue-200 hover:text-white px-4 py-2 rounded w-full justify-center bg-blue-700 dark:bg-blue-900 transition"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{darkMode ? 'Clair' : 'Sombre'}</span>
              </button>
            ) : (
              <button onClick={() => setDarkMode(!darkMode)} className="text-blue-200 hover:text-white p-2 rounded w-full flex justify-center transition">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
          </div>

          {/* Déconnexion */}
          <div className="px-2 mt-2">
            {!sidebarReduced ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-300 hover:text-white hover:bg-red-600 px-4 py-2 rounded w-full justify-center transition"
              >
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            ) : (
              <button onClick={handleLogout} className="text-red-300 hover:text-white hover:bg-red-600 p-2 rounded w-full flex justify-center transition">
                <LogOut size={20} />
              </button>
            )}
          </div>

          {/* Toggle sidebar */}
          <div className="p-2 border-t border-blue-500 flex justify-center mt-2 mb-4">
            <button
              onClick={() => setSidebarReduced(!sidebarReduced)}
              className="text-blue-200 hover:text-white transition"
              aria-label={sidebarReduced ? 'Ouvrir sidebar' : 'Réduire sidebar'}
            >
              {sidebarReduced ? <ChevronsRight size={22} /> : <ChevronsLeft size={22} />}
            </button>
          </div>
        </nav>

        {/* ══════════════════════════════════════
            CONTENU PRINCIPAL
        ══════════════════════════════════════ */}
        <main className="flex-grow overflow-x-hidden overflow-y-auto p-4 md:p-6
          text-gray-900 dark:text-gray-100 transition-colors duration-300
          pb-24 md:pb-6 {/* espace pour bottom nav mobile */}">
          {globalError && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 px-4 py-2 rounded flex items-center gap-2 mb-4">
              <XCircle size={20} />
              <span>{globalError}</span>
            </div>
          )}
          {renderSection()}
        </main>
      </div>

      {/* ══════════════════════════════════════
          BOTTOM NAV — mobile uniquement (< md)
      ══════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900
        border-t border-gray-200 dark:border-gray-700 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="flex w-full">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-colors
                ${activeTab === key
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-blue-500'}`}
            >
              {React.cloneElement(icon, { size: 20 })}
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
          {/* Déconnexion dans bottom nav */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-red-400 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-medium">Déco.</span>
          </button>
        </div>
      </nav>
    </Layout>
  );
};

export default TableauUtilisateur;