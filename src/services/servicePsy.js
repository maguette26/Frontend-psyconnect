import api from './api';

// ─── Disponibilités ───────────────────────────────────────
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

export const getDisponibilitesByProId = async (proId) => {
  if (!proId) throw new Error("L'ID professionnel est requis.");
  const response = await api.get(`/disponibilites/${proId}`)
  return response.data;
};

export const getDisponibilitesFiltrees = async (proId, date) => {
  const response = await api.get(`/disponibilites/filtrees/${proId}`, {
    params: { date },
  });
  return response.data;
};

// ─── Consultations ────────────────────────────────────────
export const getConsultations = async () => {
 const response = await api.get('/consultations/mes-consultations/professionnel');
  return response.data;
};

export const modifierConsultation = async (id, consultationData) => {
  const response = await api.put(`/consultations/${id}`, consultationData);
  return response.data;
};

// ─── Réservations ─────────────────────────────────────────
export const getReservations = async (proId) => {
  if (!proId) throw new Error("L'ID professionnel est requis.");
  const response = await api.get(`/reservations/pro/${proId}`);
  return response.data;
};

export const updateReservationStatus = async (reservationId, statut) => {
  const response = await api.put(`/reservations/${reservationId}/statut`, { statut });
  return response.data;
};

// ─── Messagerie ───────────────────────────────────────────
export const envoyerMessage = async (messageData) => {
  const response = await api.post('/messages', messageData);
  return response.data;
};

export const getMessages = async () => {
  const response = await api.get('/messages');
  return response.data;
};

// ─── Professionnels ───────────────────────────────────────
export const getAllProfessionnels = async () => {
  const response = await api.get('/professionnels/tous');
  return response.data;
};

export const getProfessionnelById = async (id) => {
  const response = await api.get(`/professionnels/${id}`);
  return response.data;
};