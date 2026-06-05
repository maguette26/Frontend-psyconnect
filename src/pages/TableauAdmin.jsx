// src/pages/TableauAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Tes composants importés
import GestionUtilisateurs from '../components/admin/GestionUtilisateurs';
import GestionProfessionnels from '../components/admin/GestionProfessionnels';
import ModerationDiscussions from '../components/admin/ModerationDiscussions';
import AdminFonctionnalites from '../components/admin/AdminFonctionnalites';

// Import des icônes Lucide React pour emojis
import { Smile, Settings, Users, UserCheck, MessageSquare } from 'lucide-react';

const menuItems = [
  {
    key: 'tableauDeBord',
    label: 'Tableau de bord',
    icon: <Smile className="w-5 h-5 mr-3" />,
  },
  {
    key: 'fonctionnalites',
    label: 'Gestion Fonctionnalités',
    icon: <Settings className="w-5 h-5 mr-3" />,
  },
  {
    key: 'utilisateurs',
    label: 'Gestion Utilisateurs',
    icon: <Users className="w-5 h-5 mr-3" />,
  },
  {
    key: 'professionnels',
    label: 'Gestion Professionnels',
    icon: <UserCheck className="w-5 h-5 mr-3" />,
  },
  {
    key: 'messages',
    label: 'Gestion Messages',
    icon: <MessageSquare className="w-5 h-5 mr-3" />,
  },
];

const TableauAdmin = () => {
  const [activeSection, setActiveSection] = useState('tableauDeBord');
  const [adminName, setAdminName] = useState('');
  const [currentAdminEmail, setCurrentAdminEmail] = useState('');
  const [currentAdminRole, setCurrentAdminRole] = useState('');
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

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'tableauDeBord':
        return (
          <div className="p-6 bg-gray-100 rounded-lg max-w-5xl mx-auto space-y-6">
            {/* Carte de bienvenue */}
            <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4">
              <Smile className="w-10 h-10 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Bonjour, <span className="text-indigo-700">{adminName}</span>
                </h2>
                <p className="text-gray-600">Ravi de vous revoir sur votre espace d'administration.</p>
              </div>
            </div>

            {/* Carte d'identité de l'admin */}
            {currentAdminEmail && currentAdminRole && (
              <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4">
                <UserCheck className="w-8 h-8 text-indigo-600" />
                <div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Email :</span> {currentAdminEmail}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Rôle :</span>{' '}
                    <span className="text-indigo-700 font-semibold">{currentAdminRole}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Introduction */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Présentation</h3>
              <div className="text-gray-700 leading-relaxed text-base">
                <p>
                  Bienvenue sur votre tableau de bord <strong>PsyConnect</strong>. Vous avez accès à l'ensemble des outils nécessaires
                  pour assurer la gestion efficace de la plateforme.
                </p>

                <p>Vous pouvez :</p>

                <ul className="list-disc ml-6 mt-2 text-gray-700">
                  <li>Gérer les utilisateurs  </li>
                  <li>Gérer les professionnels de santé mentale</li>
                  <li>Modérer les discussions</li>
                  <li>Configurer les fonctionnalités disponibles</li>
                </ul>

                <p>Utilisez le menu latéral pour naviguer entre les sections.</p>
              </div>
            </div>
          </div>
        );

      case 'fonctionnalites':
        return (
          <section className="bg-white shadow-lg rounded-lg p-6 max-w-5xl mx-auto">
            <AdminFonctionnalites />
          </section>
        );
      case 'utilisateurs':
        return (
          <section className="bg-white shadow-lg rounded-lg p-6 max-w-5xl mx-auto">
             
            <GestionUtilisateurs />
          </section>
        );
      case 'professionnels':
        return (
          <section className="bg-white shadow-lg rounded-lg p-6 max-w-5xl mx-auto">
            
            <GestionProfessionnels />
          </section>
        );
      case 'messages':
        return (
          <section className="p-6 bg-white rounded-lg shadow max-w-5xl mx-auto">
            
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar / Navbar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col h-full shadow-lg">
        <div className="p-6 text-center text-2xl font-bold border-b border-blue-700">
          <span className="text-blue-200">PsyConnect</span>
          <span className="text-white"> Admin</span>
        </div>
        <nav className="flex-grow mt-6">
          <ul>
            {menuItems.map(({ key, label, icon }) => (
              <li key={key} className="mb-2">
                <button
                  onClick={() => setActiveSection(key)}
                  className={`w-full text-left px-6 py-3 flex items-center transition-colors duration-200 ${
                    activeSection === key ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-blue-700'
                  }`}
                >
                  {icon}
                  {label}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8v8" />
            </svg>
            Se Déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{renderContent()}</main>
    </div>
  );
};

export default TableauAdmin;
