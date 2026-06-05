// src/services/serviceUtilisateur.js
import api from './api';
import { getCurrentUserInfo } from './serviceAuth';

// --- Mood Tracking ---
export const getSuiviHumeur = async () => {
    const response = await api.get('/humeurs');
    return response.data;
};

export const ajouterHumeur = async (humeurData) => {
    const response = await api.post('/humeurs', humeurData);
    return response.data;
};
export const modifierHumeur = async (id, humeurData) => {
    const response = await api.put(`/humeurs/${id}`, humeurData);
    return response.data;
};

// Supprimer une humeur existante (par id)
export const supprimerHumeur = async (id) => {
    const response = await api.delete(`/humeurs/${id}`);
    return response.data;
};

// --- Profil utilisateur ---
export const getProfil = async () => {
    try {
        const authMeResponse = await api.get('/auth/me');
        const authMeData = authMeResponse.data;
        const storedUserInfo = getCurrentUserInfo();

        const fullProfil = {
            ...storedUserInfo,
            ...authMeData
        };

        if (fullProfil.authenticated && !fullProfil.id) {
            console.warn("getProfil: User ID is missing in profile data.");
        }

        return fullProfil;
    } catch (error) {
        console.error("Erreur profil:", error.response ? error.response.data : error.message);
        return getCurrentUserInfo();
    }
};

export const modifierProfil = async (profilData) => {
    if (!profilData) throw new Error("Profile data missing.");
    try {
        const response = await api.put('/auth/profile', profilData);
        const currentStoredInfo = getCurrentUserInfo();
        if (currentStoredInfo) {
            const updatedInfo = { ...currentStoredInfo, ...profilData };
            localStorage.setItem('currentUserInfo', JSON.stringify(updatedInfo));
        }
        return response.data;
    } catch (error) {
        console.error("Erreur modification profil:", error.response?.data?.message || error.message);
        throw error;
    }
};

// --- Réservations ---
/*export const reserverConsultation = async (reservationData) => {
    try {
        const response = await api.post('/reservations', reservationData);
        return response.data;
    } catch (error) {
        console.error("Erreur réservation:", error.response?.data || error.message);
        throw error;
    }
};

export const getReservationsUtilisateur = async () => {
    try {
    
const response = await api.get('/reservations/mes-reservations');


        return response.data;
    } catch (error) {
        console.error("Erreur récupération réservations:", error.response?.data || error.message);
        throw error;
    }
};


 

export const annulerReservationUtilisateur = async (reservationId) => {
    const userInfo = getCurrentUserInfo();
    if (!userInfo || !userInfo.id) {
        throw new Error("User ID not available. Please log in.");
    }
    try {
        await api.delete(`/reservations/annuler/${reservationId}`);
    } catch (error) {
        console.error("Erreur annulation réservation:", error.response?.data || error.message);
        throw error;
    }
};*/

 

// --- Forum ---
export const getForumSujets = async () => {
    const response = await api.get('/forum/sujets');
    return response.data;
};

export const creerForumSujet = async (titre, contenu, anonyme = false) => {
    const payload = { titre, contenu, anonyme };
    const response = await api.post('/forum/sujets', payload);
    return response.data;
};

export const modifierForumSujet = async (sujetId, titre, contenu) => {
    const payload = { titre, contenu };
    const response = await api.put(`/forum/sujets/${sujetId}`, payload);
    return response.data;
};

export const supprimerForumSujet = async (sujetId) => {
    const response = await api.delete(`/forum/sujets/${sujetId}`);
    return response.data;
};

export const getForumReponses = async (sujetId) => {
    const response = await api.get(`/forum/sujets/reponses/${sujetId}`);
    return response.data;
};

export const envoyerForumReponse = async (sujetId, messageContenu, anonyme = false) => {
    const payload = { message: messageContenu, anonyme };
    const response = await api.post(`/forum/sujets/reponses/${sujetId}`, payload);
    return response.data;
};

export const modifierForumReponse = async (reponseId, message) => {
    const payload = { message };
    const response = await api.put(`/forum/sujets/reponses/modifier/${reponseId}`, payload);
    return response.data;
};

export const supprimerForumReponse = async (reponseId) => {
    const response = await api.delete(`/forum/sujets/reponses/supprimer/${reponseId}`);
    return response.data;
};
