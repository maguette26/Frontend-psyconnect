import axios from 'axios';
import api from './api';

// --- Fonctions de gestion des utilisateurs ---

/**
 * Récupère tous les utilisateurs enregistrés dans le système.
 * Nécessite les permissions ADMIN.
 * @returns {Promise<Array>} Une promesse qui résout avec une liste d'objets utilisateur.
 */
export const getAllUsers = async () => {
    try {
        console.log("serviceAdmin: Récupération de tous les utilisateurs via '/utilisateurs'...");
        // MODIFICATION ICI : Appel à /utilisateurs au lieu de /utilisateurs/all
        const response = await api.get('/utilisateurs');
        console.log("serviceAdmin: Utilisateurs récupérés:", response.data);
        return response.data;
    } catch (error) {
        console.error("serviceAdmin: Erreur lors de la récupération des utilisateurs:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Met à jour les informations d'un utilisateur spécifique.
 * Nécessite les permissions ADMIN.
 * @param {number} userId L'ID de l'utilisateur à mettre à jour.
 * @param {object} userData Les données de l'utilisateur à mettre à jour (ex: { role: 'ADMIN' }).
 * @returns {Promise<object>} Une promesse qui résout avec l'objet utilisateur mis à jour.
 */
export const updateUser = async (userId, userData) => {
    try {
        console.log(`serviceAdmin: Mise à jour de l'utilisateur ID ${userId} avec les données:`, userData);
        const response = await api.put(`/utilisateurs/${userId}`, userData);
        console.log(`serviceAdmin: Utilisateur ID ${userId} mis à jour:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`serviceAdmin: Erreur lors de la mise à jour de l'utilisateur ID ${userId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Supprime un utilisateur spécifique du système.
 * Nécessite les permissions ADMIN.
 * @param {number} userId L'ID de l'utilisateur à supprimer.
 * @returns {Promise<void>} Une promesse qui résout une fois la suppression réussie.
 */
export const deleteUser = async (userId) => {
    try {
        console.log(`serviceAdmin: Suppression de l'utilisateur ID ${userId}...`);
        await api.delete(`/utilisateurs/${userId}`);
        console.log(`serviceAdmin: Utilisateur ID ${userId} supprimé avec succès.`);
    } catch (error) {
        console.error(`serviceAdmin: Erreur lors de la suppression de l'utilisateur ID ${userId}:`, error.response?.data || error.message);
        throw error;
    }
};

// --- Fonctions de gestion des professionnels de santé mentale ---

/**
 * Récupère tous les professionnels de santé mentale (validés, en attente, refusés).
 * Nécessite les permissions ADMIN.
 * @returns {Promise<Array>} Une promesse qui résout avec une liste d'objets professionnel.
 */
export const getProfessionnels = async () => {
    try {
        console.log("serviceAdmin: Récupération de tous les professionnels de santé mentale via '/professionnels/tous'...");
        const response = await api.get('/professionnels/tous');
        console.log("serviceAdmin: Professionnels récupérés:", response.data);
        return response.data;
    } catch (error) {
        console.error("serviceAdmin: Erreur lors de la récupération des professionnels:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Met à jour le statut de validation d'un professionnel de santé mentale.
 * Nécessite les permissions ADMIN.
 * @param {number} id L'ID du professionnel à valider ou refuser.
 * @param {boolean} valide Indique si le professionnel doit être validé (true) ou refusé (false).
 * @returns {Promise<object>} Une promesse qui résout avec l'objet professionnel mis à jour.
 */
export const validateProfessionnel = async (id, valide) => {
    try {
        console.log(`serviceAdmin: Envoi de la requête de validation/refus pour professionnel ID: ${id}, valide: ${valide}`);
        const response = await api.patch(
            `/professionnels/validation/${id}`,
            { valide: valide }
        );
        console.log(`serviceAdmin: Réponse de validation/refus pour ID ${id}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`serviceAdmin: Erreur lors de la validation/refus du professionnel ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Télécharge le document justificatif d'un professionnel.
 * Nécessite les permissions ADMIN.
 * @param {string} filename Le nom du fichier à télécharger.
 * @returns {Promise<Blob>} Une promesse qui résout avec un objet Blob représentant le fichier.
 */
export const downloadDocumentJustificatif = async (filename) => {
    try {
        console.log(`serviceAdmin: Tentative de téléchargement du document: ${filename}`);
        const response = await api.get(`/professionnels/fichiers/${filename}`, {
            responseType: 'blob',
        });
        console.log(`serviceAdmin: Document '${filename}' téléchargé avec succès.`);
        return response.data;
    } catch (error) {
        console.error(`serviceAdmin: Erreur lors du téléchargement du document '${filename}':`, error.response?.data || error.message);
        throw error;
    }
};
/*export async function getDiscussions() {
    const response = await fetch('/api/forum/admin/tous', {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error("Erreur lors de la récupération des sujets de forum");
    }
    return await response.json();
}

export const supprimerDiscussion = async (id) => {
    return axios.delete(`/api/forum/admin/supprimer-sujet/${id}`);
}; */