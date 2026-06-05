// src/services/reservationService.js
import api from './api'; // Ensure this 'api' instance is configured with `baseURL: '/api'`

const reservationService = {

  /**
   * Retrieves a list of reservations for a specific professional.
   * Requires PSYCHOLOGIST or PSYCHIATRIST role.
   * @param {number} proId - The ID of the mental health professional.
   * @returns {Promise<Array>} List of reservation objects.
   */
  getReservationsForProfessional: async (proId) => {
    try {
      const response = await api.get(`/reservations/pro/${proId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching professional's reservations:", error);
      throw error;
    }
  },

  /**
   * Modifies the status of a reservation (VALIDATED/REFUSED).
   * Requires PSYCHOLOGIST or PSYCHIATRIST role.
   * @param {number} reservationId - The ID of the reservation to modify.
   * @param {string} statut - The new status ("VALIDE" or "REFUSE").
   * @returns {Promise<string>} Success message.
   */
  updateReservationStatus: async (reservationId, statut) => {
    try {
      // The backend uses @RequestParam, so the status must be passed as a URL parameter
      const response = await api.patch(`/reservations/statut/${reservationId}`, null, {
        params: { statut }
      });
      return response.data;
    } catch (error) {
      console.error("Error modifying reservation status:", error);
      throw error;
    }
  },

  /**
   * Retrieves a list of reservations for a specific user.
   * Requires USER role.
   * @param {number} utilisateurId - The ID of the user.
   * @returns {Promise<Array>} List of reservation objects.
   */
  getReservationsForUser: async (utilisateurId) => {
    try {
      const response = await api.get(`/reservations/utilisateur/${utilisateurId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user's reservations:", error);
      throw error;
    }
  },

  /**
   * Cancels an existing reservation.
   * Requires USER role.
   * @param {number} reservationId - The ID of the reservation to cancel.
   * @param {number} utilisateurId - The ID of the user performing the cancellation (for backend verification).
   * @returns {Promise<Object>} The updated reservation object.
   */
  cancelReservation: async (reservationId, utilisateurId) => {
    try {
      // The backend uses @RequestParam, so utilisateurId must be passed as a URL parameter
      const response = await api.put(`/reservations/annuler/${reservationId}`, null, {
        params: { utilisateurId }
      });
      return response.data;
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      throw error;
    }
  },

  /**
   * Creates a new reservation without initial payment.
   * Requires USER role.
   * @param {Object} reservationData - Reservation data (dateReservation, professionnel: { id: ... }).
   * @returns {Promise<Object>} The created reservation object.
   */
  createReservation: async (reservationData) => {
    try {
      const response = await api.post('/reservations', reservationData);
      return response.data;
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  },

  /**
   * Creates a new reservation with payment handling.
   * Requires USER role.
   * @param {Object} reservationData - Reservation data (dateReservation, professionnel: { id: ..., prixConsultation: ... }).
   * @param {string} paymentMethod - The payment method ("stripe" or "paypal").
   * @returns {Promise<Object>} An object containing the reservation and payment information.
   */
  createReservationWithPayment: async (reservationData, paymentMethod) => {
    try {
      const response = await api.post('/reservations', reservationData, {
        params: { modePaiement: paymentMethod }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating reservation with payment:", error);
      throw error;
    }
  }
};

export default reservationService;
