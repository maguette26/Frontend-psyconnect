import api from './api';

const reservationService = {

  getReservationsForProfessional: async (proId) => {
    const response = await api.get(`/reservations/pro/${proId}`);
    return response.data;
  },

  updateReservationStatus: async (reservationId, statut) => {
    const response = await api.put(`/reservations/statut/${reservationId}`, null, {
      params: { statut }
    });
    return response.data;
  },

  getReservationsForUser: async (utilisateurId) => {
    const response = await api.get(`/reservations/utilisateur/${utilisateurId}`);
    return response.data;
  },

  cancelReservation: async (reservationId, utilisateurId) => {
    const response = await api.put(`/reservations/annuler/${reservationId}`, null, {
      params: { utilisateurId }
    });
    return response.data;
  },

  createReservation: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  createReservationWithPayment: async (reservationData, paymentMethod) => {
    const response = await api.post('/reservations', reservationData, {
      params: { modePaiement: paymentMethod }
    });
    return response.data;
  }
};

export default reservationService;