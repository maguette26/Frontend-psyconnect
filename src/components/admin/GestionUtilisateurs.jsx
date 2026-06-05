import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUser, deleteUser } from '../../services/serviceAdmin';
import api from '../../services/api';
import { logout } from '../../services/serviceAuth';
import { Trash2 } from 'lucide-react';

const GestionUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentAdminRole, setCurrentAdminRole] = useState(null);

  const rolesDisponibles = ['USER', 'ADMIN', 'PSYCHOLOGUE', 'PSYCHIATRE', 'PREMIUM'];

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await api.get('/auth/me');
      setCurrentAdminRole(res.data.role);
      if (res.data.role === 'ADMIN') {
        fetchUsers();
      } else {
        setError("Accès refusé : Vous n'avez pas la permission d'accéder à cette page.");
      }
    } catch {
      setError("Erreur lors de la récupération des informations utilisateur. Veuillez vous reconnecter.");
    }
  };

  const fetchUsers = async () => {
    setError(null);
    setSuccessMessage(null);
    try {
      const data = await getAllUsers();
      const filteredUsers = data.filter(user => user.role === 'USER');
      setUsers(filteredUsers);
    } catch {
      setError("Impossible de charger les utilisateurs.");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await updateUser(userId, { id: userId, role: newRole });
      const updatedUser = users.find(u => u.id === userId);
      setSuccessMessage(`Rôle de ${updatedUser?.prenom || ''} ${updatedUser?.nom || ''} mis à jour en ${newRole}`);
      fetchUsers();
    } catch {
      setError("Erreur lors de la mise à jour du rôle.");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userName} ?`)) return;
    setError(null);
    setSuccessMessage(null);
    try {
      await deleteUser(userId);
      setSuccessMessage(`Utilisateur ${userName} supprimé avec succès.`);
      fetchUsers();
    } catch {
      setError("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  if (currentAdminRole && currentAdminRole !== 'ADMIN') {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 bg-red-100 text-red-800 rounded-md shadow-md text-center font-semibold">
        Vous n'avez pas la permission d'accéder à cette page.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-800">Gestion des Utilisateurs</h2>

      {/* Messages */}
      {error && (
        <p className="mb-4 text-center text-red-600 font-semibold">{error}</p>
      )}
      {successMessage && (
        <p className="mb-4 text-center text-green-600 font-semibold">{successMessage}</p>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow">
        <table className="min-w-full bg-gray-50 divide-y divide-gray-300 table-fixed">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-20">ID</th>
              <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-24">Nom</th>
              <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-24">Prénom</th>
              <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-48">Email</th>
              <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-24">Téléphone</th>
              <th className="px-3 py-3 text-xs font-semibold text-left uppercase tracking-wider w-28">Rôle</th>
              <th className="px-3 py-3 text-xs font-semibold text-center uppercase tracking-wider w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-500 italic">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="divide-x divide-gray-300 hover:bg-gray-100 transition">
                  <td className="px-3 py-2 text-sm text-gray-900 font-medium">{user.id}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 truncate">{user.nom}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 truncate">{user.prenom}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 truncate">{user.email}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{user.telephone || 'N/A'}</td>
                  <td className="px-3 py-2 text-sm">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {rolesDisponibles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteUser(user.id, `${user.prenom || ''} ${user.nom || ''}`)}
                      className="text-red-600 hover:text-red-800 focus:outline-none"
                      title={`Supprimer ${user.prenom || ''} ${user.nom || ''}`}
                      style={{ background: 'transparent', border: 'none', padding: 0 }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionUtilisateurs;
