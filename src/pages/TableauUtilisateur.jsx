import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/commun/Layout';
import SuiviHumeur from '../components/utilisateur/SuiviHumeur';
import Consultations from '../components/utilisateur/MesConsultations';

import FormulaireProfil from '../components/utilisateur/FormulaireProfil';
import MesReservations from '../components/utilisateur/MesReservations';
import { getProfil  } from '../services/serviceUtilisateur';
import { CalendarDays, UserCheck, Smile, User, XCircle, ChevronsLeft, ChevronsRight, Moon, Sun } from 'lucide-react';

const TableauUtilisateur = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [consultationsPassees, setConsultationsPassees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [consultationsError, setConsultationsError] = useState(null);
  const [activeTab, setActiveTab] = useState('reservations');
  const [sidebarReduced, setSidebarReduced] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Charger le mode sombre dans localStorage si défini, sinon false
    if (typeof window !== "undefined") {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  // Appliquer ou retirer la classe 'dark' sur body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getProfil();
        if (user?.id && user.role === 'USER') {
          setCurrentUser(user);
          setGlobalError(null);
        } else {
          setCurrentUser(null);
          setGlobalError("Accès refusé.");
        }
      } catch {
        setGlobalError("Erreur de connexion.");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const fetchConsultations = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const data = await getConsultationsUtilisateur();
      setConsultationsPassees(data);
    } catch {
      setConsultationsError("Erreur lors du chargement.");
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id) fetchConsultations();
  }, [currentUser, fetchConsultations]);

  const formatDateTime = (dateString, timeString = '') => {
    try {
      const dt = new Date(`${dateString}T${timeString}`);
      return dt.toLocaleString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: timeString ? '2-digit' : undefined,
        minute: timeString ? '2-digit' : undefined
      });
    } catch {
      return dateString;
    }
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'reservations':
        return <MesReservations onError={setGlobalError} />;
      case 'consultations':
        return  < Consultations/>;
      case 'humeur':
        return <SuiviHumeur currentUser={currentUser} />;
      case 'profil':
        return (
          <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <User size={24} /> Mes infos personnelles
            </h2>
            <FormulaireProfil />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <Layout><div className="text-center p-8 text-blue-600 dark:text-blue-400">Chargement...</div></Layout>;
  if (globalError && !currentUser) return <Layout><div className="p-6 text-red-600 dark:text-red-400">{globalError}</div></Layout>;

  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Sidebar */}
        <nav
          className={`flex flex-col justify-between bg-gradient-to-b from-blue-800 to-blue-600 text-white shadow-lg
            transition-width duration-300 ease-in-out
            ${sidebarReduced ? 'w-20' : 'w-64'}
          `}
        >
          {/* User top section */}
          <div className="flex flex-col items-center p-3 border-b border-blue-500 space-y-1">
            {currentUser?.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt="user"
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {currentUser?.prenom?.[0] || 'U'}
              </div>
            )}

            {!sidebarReduced && (
              <>
                <div className="flex gap-1 font-semibold text-base leading-tight justify-center">
                  <span>{currentUser?.prenom}</span>
                  <span>{currentUser?.nom}</span>
                </div>
                <span className="text-blue-300 text-xs">Utilisateur</span>
              </>
            )}
          </div>

          {/* Navigation items */}
          <div className="flex-grow mt-1 space-y-1 px-2">
            <NavItem
              icon={<UserCheck size={20} />}
              label="Réservations"
              active={activeTab === "reservations"}
              onClick={() => setActiveTab("reservations")}
              reduced={sidebarReduced}
            />
            <NavItem
              icon={<CalendarDays size={20} />}
              label="Consultations"
              active={activeTab === "consultations"}
              onClick={() => setActiveTab("consultations")}
              reduced={sidebarReduced}
            />
            <NavItem
              icon={<Smile size={20} />}
              label="Humeur"
              active={activeTab === "humeur"}
              onClick={() => setActiveTab("humeur")}
              reduced={sidebarReduced}
            />
            <NavItem
              icon={<User size={20} />}
              label="Profil"
              active={activeTab === "profil"}
              onClick={() => setActiveTab("profil")}
              reduced={sidebarReduced}
            />
          </div>

          {/* Mode sombre toggle */}
          <div className="flex flex-col items-center gap-1 px-2 mt-2">
            {!sidebarReduced && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 text-blue-200 hover:text-white transition px-4 py-2 rounded w-full justify-center bg-blue-700 dark:bg-blue-900"
                aria-label="Toggle mode sombre"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{darkMode ? 'Clair' : 'Sombre'}</span>
              </button>
            )}
            {sidebarReduced && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="text-blue-200 hover:text-white transition p-2 rounded"
                aria-label="Toggle mode sombre"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
          </div>

          {/* Toggle button - un peu plus haut */}
          <div className="p-1 border-t border-blue-500 flex justify-center mt-2 mb-4">
            <button
              onClick={() => setSidebarReduced(!sidebarReduced)}
              className="text-blue-200 hover:text-white transition-transform duration-200 ease-in-out"
              aria-label={sidebarReduced ? "Ouvrir sidebar" : "Réduire sidebar"}
              style={{ transformOrigin: "center" }}
            >
              {sidebarReduced ? <ChevronsRight size={24} /> : <ChevronsLeft size={24} />}
            </button>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-grow p-6 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {globalError && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 px-4 py-2 rounded flex items-center gap-2 mb-4">
              <XCircle size={20} />
              <span>{globalError}</span>
            </div>
          )}
          {renderSection()}
        </main>
      </div>
    </Layout>
  );
};

const NavItem = ({ icon, label, active, onClick, reduced }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 
      ${active ? 'bg-blue-900 dark:bg-blue-700' : 'hover:bg-blue-700 dark:hover:bg-blue-800'} ${reduced ? 'justify-center' : ''}`}
  >
    {icon}
    {!reduced && <span>{label}</span>}
  </button>
);

export default TableauUtilisateur;
