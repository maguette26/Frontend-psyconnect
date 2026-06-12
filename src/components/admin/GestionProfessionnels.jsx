// GestionProfessionnels.jsx
import React, { useEffect, useState } from 'react';
import { getProfessionnels, validateProfessionnel } from '../../services/serviceAdmin';
import api from '../../services/api';
import { logout } from '../../services/serviceAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faTimesCircle, faDownload, faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const GestionProfessionnels = () => {
  const [professionnels, setProfessionnels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('TOUS');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchUserInfoAndProfessionnels(); }, []);

  const fetchUserInfoAndProfessionnels = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.role === 'ADMIN') {
        await fetchProfessionnels();
      } else {
        handleLogoutAndRedirect();
      }
    } catch {
      handleLogoutAndRedirect();
    }
  };

  const handleLogoutAndRedirect = async () => {
    try { await logout(); } finally { navigate('/connexion'); }
  };

  const fetchProfessionnels = async () => {
    try {
      const data = await getProfessionnels();
      setProfessionnels(data.filter(p => ['PSYCHOLOGUE', 'PSYCHIATRE'].includes(p.role)));
    } catch {
      setError("Erreur lors du chargement des professionnels.");
    }
  };

  const handleValidation = async (id, valide) => {
    if (!window.confirm(valide
      ? "Confirmer la validation de ce professionnel ?"
      : "Confirmer le refus de ce professionnel ?")) return;
    try {
      await validateProfessionnel(id, valide);
      setProfessionnels(prev =>
        prev.map(p => p.id === id ? { ...p, statutValidation: valide ? 'VALIDE' : 'REFUSE' } : p)
      );
    } catch {
      setError("Erreur de validation.");
    }
  };

  // ✅ Ouvre directement l'URL Cloudinary dans un nouvel onglet
  const handleOpenDocument = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredProfessionnels = professionnels
    .filter(pro => {
      const term = searchTerm.toLowerCase();
      return (
        pro.nom?.toLowerCase().includes(term) ||
        pro.prenom?.toLowerCase().includes(term) ||
        pro.email?.toLowerCase().includes(term) ||
        pro.specialite?.toLowerCase().includes(term)
      );
    })
    .filter(pro => filterStatut === 'TOUS' || pro.statutValidation === filterStatut);

  const getBadgeClass = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'VALIDE':     return 'bg-green-100 text-green-800';
      case 'REFUSE':     return 'bg-red-100 text-red-800';
      default:           return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-800">Gestion des Professionnels</h2>

      <div className="max-w-md mx-auto mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, email ou spécialité..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="flex justify-center space-x-3 mb-8">
        {['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'].map(status => (
          <button key={status} onClick={() => setFilterStatut(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              filterStatut === status
                ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}>
            {status === 'TOUS' ? 'Tous' : status === 'EN_ATTENTE' ? 'En attente' : status === 'VALIDE' ? 'Validés' : 'Refusés'}
          </button>
        ))}
      </div>

      {filteredProfessionnels.length === 0 ? (
        <p className="text-center text-gray-600 italic mt-4">Aucun professionnel trouvé.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow">
          <table className="min-w-full bg-gray-50 divide-y divide-gray-300 table-fixed">
            <thead className="bg-indigo-600 text-white divide-x divide-white">
              <tr>
                <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-24">Nom</th>
                <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-24">Prénom</th>
                <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-48">Email</th>
                <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-24">Téléphone</th>
                <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-32">Spécialité</th>
                <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-24">Statut</th>
                <th className="px-3 py-3 text-xs font-semibold text-center uppercase tracking-wider w-16">Document</th>
                <th className="px-3 py-3 text-xs font-semibold text-center uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {filteredProfessionnels.map(pro => (
                <tr key={pro.id} className="divide-x divide-gray-300">
                  <td className="px-3 py-2 text-sm font-medium text-gray-900 truncate">{pro.nom}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 truncate">{pro.prenom}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 truncate">{pro.email}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{pro.telephone || 'N/A'}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 capitalize truncate">{pro.specialite || 'N/A'}</td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getBadgeClass(pro.statutValidation)}`}>
                      {pro.statutValidation.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {pro.documentJustificatif ? (
                      <button onClick={() => handleOpenDocument(pro.documentJustificatif)}
                        className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        title="Voir le document"
                        style={{ background: 'transparent', border: 'none', padding: 0 }}>
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center space-x-2 whitespace-nowrap">
                    <button onClick={() => handleValidation(pro.id, true)}
                      className="text-green-600 hover:text-green-800 focus:outline-none" title="Valider"
                      style={{ background: 'transparent', border: 'none', padding: 0 }}>
                      <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                    </button>
                    <button onClick={() => handleValidation(pro.id, false)}
                      className="text-red-600 hover:text-red-800 focus:outline-none" title="Refuser"
                      style={{ background: 'transparent', border: 'none', padding: 0 }}>
                      <FontAwesomeIcon icon={faTimesCircle} size="lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="text-center text-red-600 mt-4">{error}</p>}
    </div>
  );
};

export default GestionProfessionnels;