import axios from 'axios';
import api from './api'; 

// Disponibilités
export const getDisponibilites = async () => {
  const response = await api.get('/disponibilites'); 
  return response.data;
};

export const ajouterDisponibilite = async (dispoData) => {
  const response = await api.post('/disponibilites', dispoData); 
  return response.data;
};

export const modifierDisponibilite = async (id, dispoData) => {
  const response = await api.put(`/disponibilites/${id}`, dispoData); 
  return response.data;
};

export const supprimerDisponibilite = async (id) => {
  const response = await api.delete(`/disponibilites/${id}`); 
  return response.data;
};

// Consultations (pour le professionnel)
export const getConsultations = async () => {
  const response = await axios.get('/api/professionnels/mes-reservations');
  return response.data;
};


export const modifierConsultation = async (id, consultationData) => {
  const response = await api.put(`/professionnel/consultations/${id}`, consultationData);
  return response.data;
};

// Réservations (pour le professionnel)
export const getReservations = async (proId) => {
  if (!proId) {
    throw new Error("L'ID professionnel est requis pour récupérer les réservations.");
  }
  try {
    const response = await api.get(`/reservations/pro/${proId}`);
    return response.data; // liste des réservations
  } catch (error) {
    console.error(`Erreur lors de la récupération des réservations pour le pro ${proId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Mettre à jour le statut d'une réservation
export const updateReservationStatus = async (reservationId, newStatus) => {
  try {
    // Utilisation de params pour cleaner la requête
    const response = await api.put(`/reservations/statut/${reservationId}`, null, {
      params: { statut: newStatus }
    });
    return response.data; // réservation mise à jour (objet)
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut de la réservation ${reservationId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Messagerie (pour le professionnel)
export const envoyerMessage = async (messageData) => {
  const response = await api.post('/professionnel/messages', messageData);
  return response.data;
};

export const getMessages = async () => {
  const response = await api.get('/professionnel/messages');
  return response.data;
};

// Récupère les disponibilités d'un professionnel spécifique, filtrées par date (utilisé par l'utilisateur)
export const getDisponibilitesFiltrees = async (proId, date) => {
  try {
    const response = await api.get(`/disponibilites/filtrees/${proId}?date=${date}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des disponibilités filtrées pour le pro ${proId} à la date ${date}:`, error.response?.data || error.message);
    throw error;
  }
};

// --- NOUVELLES FONCTIONS (pour la recherche de professionnels) ---

/**
 * Récupère la liste de tous les professionnels validés.
 * Correspond à GET /api/professionnels
 * @returns {Promise<Array<object>>} Liste des objets ProfessionnelSanteMentale.
 */
export const getAllProfessionnels = async () => {
  try {
    const response = await api.get('/professionnels'); // Endpoint qui devrait retourner les validés par défaut
    console.log("ServiceProfessionnel: Liste des professionnels récupérée:", response.data);
    return response.data;
  } catch (error) {
    console.error("ServiceProfessionnel: Erreur lors de la récupération de tous les professionnels:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Récupère les détails d'un professionnel spécifique par son ID.
 * Correspond à GET /api/professionnels/{id}
 * @param {number} id - L'ID du professionnel.
 * @returns {Promise<object>} L'objet ProfessionnelSanteMentale.
 */
export const getProfessionnelById = async (id) => {
  try {
    const response = await api.get(`/professionnels/${id}`);
    console.log(`ServiceProfessionnel: Détails du professionnel ${id} récupérés:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`ServiceProfessionnel: Erreur lors de la récupération du professionnel ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Récupère les disponibilités d'un professionnel par son ID.
 * Correspond à GET /api/disponibilites/{proId}
 * @param {number} proId - L'ID du professionnel.
 * @returns {Promise<Array<object>>} Liste des disponibilités.
 */
export const getDisponibilitesByProId = async (proId) => {
  if (!proId) {
    throw new Error("L'ID professionnel est requis pour récupérer les disponibilités.");
  }
  try {
    const response = await api.get(`/disponibilites/${proId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des disponibilités pour le pro ${proId}:`, error.response?.data || error.message);
    throw error;
  }
};