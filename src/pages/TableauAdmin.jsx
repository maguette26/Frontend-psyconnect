// src/pages/TableauAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Composants importés
import GestionUtilisateurs from '../components/admin/GestionUtilisateurs';
import GestionProfessionnels from '../components/admin/GestionProfessionnels';
import ModerationDiscussions from '../components/admin/ModerationDiscussions';
import AdminFonctionnalites from '../components/admin/AdminFonctionnalites';

// Icônes Lucide React
import { Smile, Settings, Users, UserCheck, MessageSquare, Menu, X, LogOut } from 'lucide-react';

const menuItems = [
  {
    key: 'tableauDeBord',
    label: 'Tableau de bord',
    icon: <Smile className="w-5 h-5 shrink-0" />,
  },
  {
    key: 'fonctionnalites',
    label: 'Gestion Fonctionnalités',
    icon: <Settings className="w-5 h-5 shrink-0" />,
  },
  {
    key: 'utilisateurs',
    label: 'Gestion Utilisateurs',
    icon: <Users className="w-5 h-5 shrink-0" />,
  },
  {
    key: 'professionnels',
    label: 'Gestion Professionnels',
    icon: <UserCheck className="w-5 h-5 shrink-0" />,
  },
  {
    key: 'messages',
    label: 'Gestion Messages',
    icon: <MessageSquare className="w-5 h-5 shrink-0" />,
  },
];

const TableauAdmin = () => {
  const [activeSection, setActiveSection] = useState('tableauDeBord');
  const [adminName, setAdminName] = useState('');
  const [currentAdminEmail, setCurrentAdminEmail] = useState('');
  const [currentAdminRole, setCurrentAdminRole] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUserJSON = localStorage.getItem('currentUser');
    if (currentUserJSON) {
      try {
        const currentUser = JSON.parse(currentUserJSON);
        const prenom = currentUser.prenom || '';
        const nom = currentUser.nom || '';
        const email = currentUser.email || '';
        const role = currentUser.role || '';

        const fullName = (prenom + ' ' + nom).trim();
        setAdminName(fullName || 'Admin');
        setCurrentAdminEmail(email);
        setCurrentAdminRole(role);
      } catch (error) {
        console.error('Erreur parsing currentUser depuis localStorage:', error);
        setAdminName('Admin');
      }
    } else {
      setAdminName('Admin');
    }
  }, []);

  // Empêche le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleSelectSection = (key) => {
    setActiveSection(key);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'tableauDeBord':
        return (
          <div className="p-3 sm:p-6 bg-gray-100 rounded-lg max-w-5xl mx-auto space-y-4 sm:space-y-6">
            {/* Carte de bienvenue */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md flex items-center gap-3 sm:gap-4 min-w-0">
              <Smile className="w-9 h-9 sm:w-10 sm:h-10 text-yellow-400 shrink-0" />
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 break-words">
                  Bonjour, <span className="text-indigo-700">{adminName}</span>
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Ravi de vous revoir sur votre espace d'administration.</p>
              </div>
            </div>

            {/* Carte d'identité de l'admin */}
            {currentAdminEmail && currentAdminRole && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md flex items-center gap-3 sm:gap-4 min-w-0">
                <UserCheck className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm sm:text-base text-gray-700 break-words">
                    <span className="font-semibold">Email :</span> {currentAdminEmail}
                  </p>
                  <p className="text-sm sm:text-base text-gray-700">
                    <span className="font-semibold">Rôle :</span>{' '}
                    <span className="text-indigo-700 font-semibold">{currentAdminRole}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Introduction */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Présentation</h3>
              <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                <p>
                  Bienvenue sur votre tableau de bord <strong>PsyConnect</strong>. Vous avez accès à l'ensemble des outils nécessaires
                  pour assurer la gestion efficace de la plateforme.
                </p>

                <p className="mt-2">Vous pouvez :</p>

                <ul className="list-disc ml-5 sm:ml-6 mt-2 text-gray-700 space-y-1">
                  <li>Gérer les utilisateurs</li>
                  <li>Gérer les professionnels de santé mentale</li>
                  <li>Modérer les discussions</li>
                  <li>Configurer les fonctionnalités disponibles</li>
                </ul>

                <p className="mt-2">Utilisez le menu pour naviguer entre les sections.</p>
              </div>
            </div>
          </div>
        );

      case 'fonctionnalites':
        return (
          <section className="bg-white shadow-lg rounded-lg p-3 sm:p-6 max-w-5xl mx-auto overflow-x-auto">
            <AdminFonctionnalites />
          </section>
        );
      case 'utilisateurs':
        return (
          <section className="bg-white shadow-lg rounded-lg p-3 sm:p-6 max-w-5xl mx-auto overflow-x-auto">
            <GestionUtilisateurs />
          </section>
        );
      case 'professionnels':
        return (
          <section className="bg-white shadow-lg rounded-lg p-3 sm:p-6 max-w-5xl mx-auto overflow-x-auto">
            <GestionProfessionnels />
          </section>
        );
      case 'messages':
        return (
          <section className="p-3 sm:p-6 bg-white rounded-lg shadow max-w-5xl mx-auto overflow-x-auto">
            <ModerationDiscussions />
          </section>
        );
      default:
        return (
          <div className="p-6 text-center text-gray-600">
            Sélectionnez une option dans le menu latéral.
          </div>
        );
    }
  };

  const currentLabel = menuItems.find((m) => m.key === activeSection)?.label || 'Admin';

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">

      {/* ══════════════════════════════════════
          TOPBAR MOBILE (< md) — safe-area gérée
      ══════════════════════════════════════ */}
      <header
        className="flex md:hidden items-center justify-between bg-blue-800 text-white px-4 shrink-0 shadow-md z-30"
        style={{ paddingTop: 'env(safe-area-inset-top)', minHeight: 'calc(56px + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-base truncate">PsyConnect Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Ouvrir le menu"
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-blue-700 transition shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Bandeau indiquant la section active sur mobile */}
      <div className="md:hidden bg-blue-700 text-blue-100 text-xs font-semibold px-4 py-2 truncate shrink-0">
        {currentLabel}
      </div>

      {/* ══════════════════════════════════════
          DRAWER MOBILE
      ══════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            className="absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-blue-800 text-white flex flex-col shadow-2xl"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between p-5 border-b border-blue-700 shrink-0">
              <div className="text-lg font-bold truncate">
                <span className="text-blue-200">PsyConnect</span>
                <span className="text-white"> Admin</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-700 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-grow overflow-y-auto py-4">
              <ul>
                {menuItems.map(({ key, label, icon }) => (
                  <li key={key} className="mb-1 px-2">
                    <button
                      onClick={() => handleSelectSection(key)}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors duration-200 min-w-0 ${
                        activeSection === key ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-blue-700'
                      }`}
                    >
                      {icon}
                      <span className="truncate">{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t border-blue-700 shrink-0">
              <button
                onClick={handleLogout}
                className="w-full bg-blue-700 hover:bg-blue-900 text-white py-2.5 rounded-md transition duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4.5 h-4.5 shrink-0" />
                <span>Se Déconnecter</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ══════════════════════════════════════
          SIDEBAR DESKTOP (md+)
      ══════════════════════════════════════ */}
      <aside className="hidden md:flex w-64 bg-blue-800 text-white flex-col h-full shadow-lg shrink-0">
        <div className="p-6 text-center text-2xl font-bold border-b border-blue-700">
          <span className="text-blue-200">PsyConnect</span>
          <span className="text-white"> Admin</span>
        </div>
        <nav className="flex-grow mt-6 overflow-y-auto">
          <ul>
            {menuItems.map(({ key, label, icon }) => (
              <li key={key} className="mb-2">
                <button
                  onClick={() => setActiveSection(key)}
                  className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors duration-200 ${
                    activeSection === key ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-blue-700'
                  }`}
                >
                  {icon}
                  <span className="truncate">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-blue-700 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-blue-700 hover:bg-blue-900 text-white py-2 rounded-md transition duration-200 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            Se Déconnecter
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          CONTENU PRINCIPAL
      ══════════════════════════════════════ */}
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-3 sm:p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default TableauAdmin;