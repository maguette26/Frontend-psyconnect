// src/services/servicePsy.js
import api from './api';

/* ══════════════════════════════════════════════════════════
   HEALTH CHECK
   Ping le backend avant une action critique.
   Railway peut mettre ~5-10s à se réveiller → on attend.
══════════════════════════════════════════════════════════ */
export const pingBackend = async (maxWait = 12000) => {
  const start = Date.now();
  const INTERVAL = 2000;

  while (Date.now() - start < maxWait) {
    try {
      await api.get('/health', { timeout: 3000, _retryCount: MAX_RETRIES }); // skip retry loop
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, INTERVAL));
    }
  }
  throw new Error('Backend indisponible après ' + maxWait / 1000 + 's');
};

// Réutilisation de la constante (cohérence avec api.js)
const MAX_RETRIES = 99; // valeur sentinelle pour désactiver le retry sur le ping lui-même

/* ── Disponibilités ──────────────────────────────────────── */
export const getDisponibilites = async () => {
  const res = await api.get('/disponibilites');
  return res.data;
};

export const ajouterDisponibilite = async (dispoData) => {
  const res = await api.post('/disponibilites', dispoData);
  return res.data;
};

export const modifierDisponibilite = async (id, dispoData) => {
  const res = await api.put(`/disponibilites/${id}`, dispoData);
  return res.data;
};

export const supprimerDisponibilite = async (id) => {
  const res = await api.delete(`/disponibilites/${id}`);
  return res.data;
};

export const getDisponibilitesByProId = async (proId) => {
  if (!proId) throw new Error("L'ID professionnel est requis.");
  const res = await api.get(`/disponibilites/${proId}`);
  return res.data;
};

export const getDisponibilitesFiltrees = async (proId, date) => {
  const res = await api.get(`/disponibilites/filtrees/${proId}`, { params: { date } });
  return res.data;
};

/* ── Consultations ──────────────────────────────────────── */
export const getConsultations = async () => {
  const res = await api.get('/consultations/mes-consultations/professionnel');
  return res.data;
};

export const modifierConsultation = async (id, consultationData) => {
  const res = await api.put(`/consultations/${id}`, consultationData);
  return res.data;
};

/* ── Réservations ───────────────────────────────────────── */
export const getReservations = async (proId) => {
  if (!proId) throw new Error("L'ID professionnel est requis.");
  const res = await api.get(`/reservations/pro/${proId}`);
  return res.data;
};

/**
 * Met à jour le statut d'une réservation.
 * Validation côté client avant l'appel réseau.
 */
const STATUTS_VALIDES = ['EN_ATTENTE', 'VALIDE', 'REFUSE'];

export const updateReservationStatus = async (reservationId, statut) => {
  if (!reservationId) throw new Error('reservationId manquant.');
  if (!STATUTS_VALIDES.includes(statut))
    throw new Error(`Statut invalide : ${statut}. Valeurs attendues : ${STATUTS_VALIDES.join(', ')}`);

  const res = await api.put(`/reservations/${reservationId}/statut`, { statut });
  return res.data;
};

/* ── Messagerie ─────────────────────────────────────────── */
export const envoyerMessage = async (messageData) => {
  const res = await api.post('/messages', messageData);
  return res.data;
};

export const getMessages = async () => {
  const res = await api.get('/messages');
  return res.data;
};

/* ── Professionnels ─────────────────────────────────────── */
export const getAllProfessionnels = async () => {
  const res = await api.get('/professionnels/tous');
  return res.data;
};

export const getProfessionnelById = async (id) => {
  const res = await api.get(`/professionnels/${id}`);
  return res.data;
};