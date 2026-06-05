// src/services/serviceAuth.js
import api from './api'; 

const USER_INFO_KEY = 'currentUserInfo'; 

export const login = async (email, motDePasse) => {
    console.log(`serviceAuth: Tentative de connexion pour ${email} vers ${api.defaults.baseURL}/auth/login`);
    try {
        const response = await api.post('/auth/login', { email, motDePasse });
        // --- POINT CRITIQUE DE DÉBOGAGE ---
        // VÉRIFIEZ CE LOG DANS VOTRE CONSOLE APRÈS LA CONNEXION.
        // L'objet 'response.data' DOIT contenir un champ 'id'.
        // Exemple attendu : { id: 123, email: "user@example.com", role: "USER", nom: "Doe", prenom: "John" }
        console.log("serviceAuth: Connexion réussie, backend response.data:", response.data); 

        const userInfo = response.data; 

        if (userInfo && userInfo.id && userInfo.email && userInfo.role) { 
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
            console.log(`serviceAuth: Informations utilisateur complètes (ID: ${userInfo.id}, Role: ${userInfo.role}) stockées dans localStorage.`);
        } else {
            console.warn("serviceAuth: La réponse de connexion du backend est incomplète (manque ID, email ou rôle). Stockage des informations partielles.", userInfo);
            // Si 'id' est manquant ici, c'est que le backend ne l'envoie pas.
            // C'est la source de l'erreur "User ID not available".
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo)); 
        }

        return userInfo; 
    } catch (error) {
        console.error("serviceAuth: Erreur de connexion:", error.response ? error.response.data : error.message, error);
        throw error;
    }
};

export const logout = async () => {
    console.log(`serviceAuth: Tentative de déconnexion vers ${api.defaults.baseURL}/auth/logout`);
    try {
        await api.post('/auth/logout');
        console.log("serviceAuth: Requête de déconnexion envoyée avec succès au backend.");
    } catch (error) {
        console.error("serviceAuth: Erreur lors de la déconnexion backend:", error.response ? error.response.data : error.message, error);
    } finally {
        localStorage.removeItem(USER_INFO_KEY); 
        console.log("serviceAuth: Informations utilisateur effacées de localStorage.");
    }
};

export const getCurrentUserInfo = () => {
    const userInfoString = localStorage.getItem(USER_INFO_KEY);
    if (userInfoString) {
        try {
            const userInfo = JSON.parse(userInfoString);
            return userInfo;
        } catch (e) {
            console.error("serviceAuth: Erreur lors de l'analyse des informations utilisateur depuis localStorage:", e);
            localStorage.removeItem(USER_INFO_KEY); 
            return null;
        }
    }
    return null;
};