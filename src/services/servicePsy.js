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
      await api.get('/health', { timeout: 3000, _retryCount: MAX_RETRIES });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, INTERVAL));
    }
  }
  throw new Error('Backend indisponible après ' + maxWait / 1000 + 's');
};

const MAX_RETRIES = 99;

/* ── Disponibilités ──────────────────────────────────────── */
export const getDisponibilites = async () => {
  const res = await api.get('/disponibilites');
  return res.data;
};

export const ajouterDisponibilite = async (dispoData, attempt = 0) => {
  try {
    const res = await api.post('/disponibilites', dispoData, { timeout: 35000 });
    return res.data;
  } catch (err) {
    const isNetworkError = !err.response;
    const hasRetries = attempt < RETRY_DELAYS.length;

    if (isNetworkError && hasRetries) {
      console.warn(
        `[ajouterDisponibilite] Tentative ${attempt + 1} échouée, retry dans ${RETRY_DELAYS[attempt] / 1000}s...`
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      return ajouterDisponibilite(dispoData, attempt + 1);
    }

    throw err;
  }
};

export const modifierDisponibilite = async (id, dispoData, attempt = 0) => {
  try {
    const res = await api.put(`/disponibilites/${id}`, dispoData, { timeout: 35000 });
    return res.data;
  } catch (err) {
    const isNetworkError = !err.response;
    const hasRetries = attempt < RETRY_DELAYS.length;

    if (isNetworkError && hasRetries) {
      console.warn(
        `[modifierDisponibilite] Tentative ${attempt + 1} échouée, retry dans ${RETRY_DELAYS[attempt] / 1000}s...`
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      return modifierDisponibilite(id, dispoData, attempt + 1);
    }

    throw err;
  }
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
 * Retry automatique en cas d'échec réseau (ex: Railway en veille).
 * - 3 tentatives max
 * - délai exponentiel : 2s, 4s, 8s
 * - timeout étendu à 35s pour laisser le temps à Railway de se réveiller
 */
const STATUTS_VALIDES = ['EN_ATTENTE', 'VALIDE', 'REFUSE'];
const RETRY_DELAYS = [2000, 4000, 8000];

export const updateReservationStatus = async (reservationId, statut, attempt = 0) => {
  if (!reservationId) throw new Error('reservationId manquant.');
  if (!STATUTS_VALIDES.includes(statut))
    throw new Error(`Statut invalide : ${statut}. Valeurs attendues : ${STATUTS_VALIDES.join(', ')}`);

  try {
    const res = await api.put(
      `/reservations/${reservationId}/statut`,
      { statut },
      { timeout: 35000 }
    );
    return res.data;
  } catch (err) {
    const isNetworkError = !err.response; // pas de réponse = Railway en veille ou coupure réseau
    const hasRetries = attempt < RETRY_DELAYS.length;

    if (isNetworkError && hasRetries) {
      console.warn(
        `[updateReservationStatus] Tentative ${attempt + 1} échouée, retry dans ${RETRY_DELAYS[attempt] / 1000}s...`
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      return updateReservationStatus(reservationId, statut, attempt + 1);
    }

    throw err; // erreur HTTP (4xx/5xx) ou retries épuisés → on remonte
  }
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