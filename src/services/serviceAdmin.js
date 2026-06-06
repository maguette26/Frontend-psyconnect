import api from './api';

// Utilisateurs
export const getAllUsers = async () => {
  const response = await api.get('/utilisateurs');
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/utilisateurs/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  await api.delete(`/utilisateurs/${userId}`);
};

// Professionnels
export const getProfessionnels = async () => {
  const response = await api.get('/professionnels/tous');
  return response.data;
};

export const validateProfessionnel = async (id, valide) => {
  const response = await api.patch(`/professionnels/validation/${id}`, { valide });
  return response.data;
};

export const downloadDocumentJustificatif = async (filename) => {
  const response = await api.get(`/professionnels/fichiers/${filename}`, {
    responseType: 'blob',
  });
  return response.data;
};