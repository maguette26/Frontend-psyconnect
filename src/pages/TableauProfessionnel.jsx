import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/commun/Layout';
import Reservations from '../components/professionel/Reservations';
import Consultations from '../components/professionel/Consultations';
import Disponibilite from '../components/professionel/Disponibilite';
import { getCurrentUserInfo } from '../services/serviceAuth';
import {
  CalendarDays, UserCheck, Info, ChevronsLeft, ChevronsRight,
  Moon, Sun, XCircle, Smile, LogOut
} from 'lucide-react';

/* ─────────────────────────────────────────
   NavItem
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
  { key: 'informations',   label: 'Informations',   icon: <Info        size={20} /> },
  { key: 'disponibilites', label: 'Disponibilités', icon: <CalendarDays size={20} /> },
  { key: 'reservations',   label: 'Réservations',   icon: <UserCheck   size={20} /> },
  { key: 'consultations',  label: 'Consultations',  icon: <CalendarDays size={20} /> },
];

/* ─────────────────────────────────────────
   Composant principal
───────────────────────────────────────── */
const TableauProfessionnel = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [globalError, setGlobalError]       = useState(null);
  const [activeTab, setActiveTab]           = useState('informations');
  const [sidebarReduced, setSidebarReduced] = useState(false);
  const [darkMode, setDarkMode]             = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    try {
      const user = getCurrentUserInfo();
      if (!user || !['PSYCHOLOGUE', 'PSYCHIATRE'].includes(user.role)) {
        setGlobalError("Accès refusé : vous n'êtes pas un professionnel de santé mentale.");
        navigate('/connexion');
      } else {
        setCurrentUser(user);
      }
    } catch {
      setGlobalError("Erreur lors du chargement de l'utilisateur.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  /* ── sections ── */
  const renderSection = () => {
    switch (activeTab) {
      case 'informations':
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex items-center gap-4">
              <Smile className="w-10 h-10 text-green-500 shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Bonjour, <span className="text-indigo-700">{currentUser?.prenom} {currentUser?.nom}</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300">Bienvenue dans votre espace professionnel PsyConnect.</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Présentation</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-teal-500 shrink-0" /> Gérer vos disponibilités</li>
                <li className="flex items-center gap-2"><UserCheck className="w-5 h-5 text-pink-500 shrink-0" /> Valider ou refuser les réservations</li>
                <li className="flex items-center gap-2"><Info className="w-5 h-5 text-blue-500 shrink-0" /> Accéder à vos consultations et profils patients</li>
              </ul>
              <p className="mt-4 text-gray-700 dark:text-gray-300">Utilisez le menu pour naviguer entre les sections.</p>
            </div>
          </div>
        );
      case 'disponibilites': return <Disponibilite proId={currentUser?.id} />;
      case 'reservations':   return <Reservations proId={currentUser?.id} />;
      case 'consultations':  return <Consultations />;
      default:               return null;
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
          {/* Avatar */}
          <div className="flex flex-col items-center p-4 border-b border-blue-500 space-y-1">
            {currentUser?.photoUrl ? (
              <img src={currentUser.photoUrl} alt="pro" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-xl font-bold">
                {currentUser?.prenom?.[0] || 'P'}
              </div>
            )}
            {!sidebarReduced && (
              <>
                <p className="font-semibold text-base leading-tight text-center">
                  {currentUser?.prenom} {currentUser?.nom}
                </p>
                <span className="text-blue-300 text-xs">Professionnel</span>
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
            >
              {sidebarReduced ? <ChevronsRight size={22} /> : <ChevronsLeft size={22} />}
            </button>
          </div>
        </nav>

        {/* ══════════════════════════════════════
            CONTENU PRINCIPAL
        ══════════════════════════════════════ */}
        <main className="flex-grow overflow-x-hidden overflow-y-auto p-4 md:p-6
          text-gray-900 dark:text-gray-100 transition-colors duration-300 pb-24 md:pb-6">
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
        <div className="flex w-full overflow-x-auto">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center justify-center flex-1 min-w-[60px] py-2 gap-0.5 transition-colors
                ${activeTab === key
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-blue-500'}`}
            >
              {React.cloneElement(icon, { size: 20 })}
              <span className="text-[9px] font-medium leading-tight">{label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 min-w-[60px] py-2 gap-0.5 text-red-400 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[9px] font-medium leading-tight">Déco.</span>
          </button>
        </div>
      </nav>
    </Layout>
  );
};

export default TableauProfessionnel;