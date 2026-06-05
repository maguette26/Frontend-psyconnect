import React, { useEffect, useState } from 'react';
import { getConsultations } from '../../services/servicePsy';
import { CheckCircle } from 'lucide-react';

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('TOUTES');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConsultations = async () => {
    try {
      const data = await getConsultations();
      setConsultations(data);
      setError(null);
    } catch (e) {
      console.error("Erreur lors du chargement :", e);
      setError("Erreur lors du chargement des consultations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const parseDateTime = (dateStr, timeStr) => {
    try {
      return new Date(`${dateStr}T${timeStr || '00:00'}`);
    } catch {
      return new Date(0);
    }
  };

  const consultationsFiltrees = consultations
    .filter(({ statut }) => {
      return filtreStatut === 'TOUTES' || statut === filtreStatut;
    })
    .sort((a, b) =>
      parseDateTime(a.date, a.heure) - parseDateTime(b.date, b.heure)
    );

  const getStatutStyle = (statut) => {
    switch (statut) {
      case 'CONFIRMEE':
        return 'text-green-600 font-medium';
      case 'EN_ATTENTE':
        return 'text-yellow-600 font-medium';
      case 'TERMINEE':
        return 'text-gray-600 font-medium';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
        <CheckCircle size={24} /> Mes consultations
      </h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Filtres */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {['TOUTES', 'EN_ATTENTE', 'CONFIRMEE', 'TERMINEE'].map((statut) => (
          <button
            key={statut}
            onClick={() => setFiltreStatut(statut)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-150 ${
              filtreStatut === statut
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {statut === 'TOUTES'
              ? 'Toutes'
              : statut === 'EN_ATTENTE'
              ? 'En attente'
              : statut === 'CONFIRMEE'
              ? 'Confirmées'
              : 'Terminées'}
          </button>
        ))}
      </div>

      {consultationsFiltrees.length === 0 ? (
        <p className="text-gray-500">Vous n'avez aucune consultation pour le moment</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Heure</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Utilisateur</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Email</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm">
              {consultationsFiltrees.map(({ id, date, heure, utilisateurNom, utilisateurPrenom, utilisateurEmail, statut }, index) => (
                <tr
                  key={id}
                  className={`border-t transition-all duration-150 ${
                    index % 2 === 0 ? 'bg-blue-50/20' : 'bg-white'
                  } hover:bg-blue-50`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{date}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{heure}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {utilisateurPrenom} {utilisateurNom}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {utilisateurEmail || 'Email inconnu'}
                  </td>
                  <td className={`px-4 py-3 capitalize ${getStatutStyle(statut)}`}>
                    {statut.toLowerCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Consultations;
