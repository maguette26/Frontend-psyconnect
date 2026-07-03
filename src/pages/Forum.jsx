// src/pages/Forum.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/commun/Layout';
import { getCurrentUserInfo } from '../services/serviceAuth';
import {
    getForumSujets,
    creerForumSujet,
    getProfil,
    getForumReponses,
    envoyerForumReponse,
    modifierForumSujet,
    supprimerForumSujet,
    modifierForumReponse,
    supprimerForumReponse
} from '../services/serviceUtilisateur';
import {
    MessageSquare,
    Clock,
    User,
    UserCircle2,
    Edit,
    Trash2,
    ChevronLeft,
    Send,
    Plus,
    Check,
    X
} from 'lucide-react';

const getAuthorInitial = (author, isAnonymous) => {
    if (isAnonymous) return 'A';
    if (author?.nom) return author.nom.charAt(0).toUpperCase();
    if (author?.prenom) return author.prenom.charAt(0).toUpperCase();
    if (author?.email) return author.email.charAt(0).toUpperCase();
    return '?';
};

// FIX: certains backends renvoient dateCreation / createdAt / date selon le DTO.
// On tente plusieurs clés au lieu de dépendre d'un seul nom de champ.
const pickDate = (obj, ...keys) => {
    for (const k of keys) {
        if (obj?.[k]) return obj[k];
    }
    return null;
};

const formatRelativeTime = (dateTimeString) => {
    if (!dateTimeString) return 'Date inconnue';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return 'Date inconnue';
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `à l'instant`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `il y a ${days}j`;
    const months = Math.floor(days / 30);
    if (months < 12) return `il y a ${months}mois`;
    const years = Math.floor(months / 12);
    return `il y a ${years}an${years > 1 ? 's' : ''}`;
};

const Forum = () => {
    const [sujets, setSujets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [nouveauTitre, setNouveauTitre] = useState('');
    const [nouveauContenu, setNouveauContenu] = useState('');
    const [isSujetAnonyme, setIsSujetAnonyme] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [reponses, setReponses] = useState([]);
    const [nouveauMessageReponse, setNouveauMessageReponse] = useState('');
    const [isReponseAnonyme, setIsReponseAnonyme] = useState(false);
    const [loadingReponses, setLoadingReponses] = useState(false);
    const [errorReponses, setErrorReponses] = useState(null);
    const [successMessageReponse, setSuccessMessageReponse] = useState(null);
    const [editingSujetId, setEditingSujetId] = useState(null);
    const [editingSujetTitre, setEditingSujetTitre] = useState('');
    const [editingSujetContenu, setEditingSujetContenu] = useState('');
    const [editingReponseId, setEditingReponseId] = useState(null);
    const [editingReponseMessage, setEditingReponseMessage] = useState('');

    const getAuthorDisplayName = (author, isAnonymous) => {
        if (isAnonymous) return 'Anonyme';
        if (author?.nom && author?.prenom) return `${author.nom} ${author.prenom}`;
        if (author?.email) return author.email;
        return 'Auteur inconnu';
    };

    const isAuthor = (authorEmail) => {
        return isAuthenticated && currentUserEmail && currentUserEmail === authorEmail;
    };

    const isAdmin = () => {
        return isAuthenticated && currentUserRole === 'ADMIN';
    };

    const handleBackToList = () => {
        setSelectedTopic(null);
        setReponses([]);
        setNouveauMessageReponse('');
        setIsReponseAnonyme(false);
        setErrorReponses(null);
        setSuccessMessageReponse(null);
        fetchSujets();
    };

    // FIX: normalisation des champs date + tri par dernière activité
    const normalizeSujet = (sujet) => {
        const dateCreation = pickDate(sujet, 'dateCreation', 'createdAt', 'date');
        const derniereActivite = pickDate(sujet, 'derniereActivite', 'dateDerniereReponse', 'updatedAt') || dateCreation;
        return {
            ...sujet,
            dateCreation,
            derniereActivite,
            reponsesCount: parseInt(sujet.reponsesCount, 10) || 0
        };
    };

    const fetchSujets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getForumSujets();
            const formattedSujets = data
                .map(normalizeSujet)
                .sort((a, b) => new Date(b.derniereActivite || 0) - new Date(a.derniereActivite || 0));
            setSujets(formattedSujets);
        } catch (err) {
            setError("Impossible de charger les sujets du forum. Veuillez réessayer plus tard.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
       const fetchAuthStatus = async () => {
    try {
        const profilData = getCurrentUserInfo();
        const token = localStorage.getItem('token');
        if (profilData && token) {
            setIsAuthenticated(true);
            setCurrentUserEmail(profilData.email);
            setCurrentUserRole(profilData.role);
            setCurrentUserId(profilData.id);
        } else {
            setIsAuthenticated(false);
        }
    } catch (err) {
        setIsAuthenticated(false);
    }
};
        fetchAuthStatus();
        fetchSujets();
    }, [fetchSujets]);

    useEffect(() => {
        const fetchReponses = async () => {
            if (!selectedTopic?.id) {
                setReponses([]);
                setLoadingReponses(false);
                return;
            }
            setLoadingReponses(true);
            setErrorReponses(null);
            try {
                const data = await getForumReponses(selectedTopic.id);
                const formatted = data.map(r => ({
                    ...r,
                    dateReponse: pickDate(r, 'dateReponse', 'createdAt', 'date')
                }));
                setReponses(formatted);
            } catch (err) {
                setErrorReponses("Impossible de charger les réponses du sujet.");
            } finally {
                setLoadingReponses(false);
            }
        };
        fetchReponses();
    }, [selectedTopic]);

    const handleSubmitSujet = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!nouveauTitre.trim() || !nouveauContenu.trim()) {
            setError("Le titre et le contenu du sujet ne peuvent pas être vides.");
            return;
        }
        if (!isAuthenticated) {
            setError("Vous devez être connecté pour créer un sujet.");
            return;
        }

        try {
            const nouveauSujet = await creerForumSujet(nouveauTitre, nouveauContenu, isSujetAnonyme);
            setSujets(prev => [normalizeSujet({ ...nouveauSujet, reponsesCount: 0 }), ...prev]);
            setNouveauTitre('');
            setNouveauContenu('');
            setIsSujetAnonyme(false);
            setSuccessMessage("Sujet créé avec succès !");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "certains mots utilisés ne sont pas autorisés dans la création du sujet. Veuillez reformuler.");
        }
    };

    const handleSubmitReponse = async (e) => {
        e.preventDefault();
        setErrorReponses(null);
        setSuccessMessageReponse(null);

        if (!nouveauMessageReponse.trim()) {
            setErrorReponses("Votre message ne peut pas être vide.");
            return;
        }
        if (!isAuthenticated) {
            setErrorReponses("Vous devez être connecté pour répondre.");
            return;
        }
        if (!selectedTopic?.id) {
            setErrorReponses("Aucun sujet sélectionné pour la réponse.");
            return;
        }

        try {
            const nouvelleReponse = await envoyerForumReponse(selectedTopic.id, nouveauMessageReponse, isReponseAnonyme);
            const dateReponse = pickDate(nouvelleReponse, 'dateReponse', 'createdAt', 'date') || new Date().toISOString();
            setReponses(prev => [...prev, { ...nouvelleReponse, dateReponse }]);
            setNouveauMessageReponse('');
            setIsReponseAnonyme(false);
            setSuccessMessageReponse("Réponse envoyée avec succès !");
            setTimeout(() => setSuccessMessageReponse(null), 3000);

            // FIX: mise à jour optimiste immédiate du compteur + de la dernière activité,
            // à la fois sur le sujet ouvert et dans la liste, sans attendre le refetch.
            setSelectedTopic(prev => ({
                ...prev,
                reponsesCount: (prev.reponsesCount || 0) + 1,
                derniereActivite: dateReponse
            }));
            setSujets(prev => prev
                .map(s => s.id === selectedTopic.id
                    ? { ...s, reponsesCount: (s.reponsesCount || 0) + 1, derniereActivite: dateReponse }
                    : s)
                .sort((a, b) => new Date(b.derniereActivite || 0) - new Date(a.derniereActivite || 0))
            );

            // Le backend reste la source de vérité : on resynchronise ensuite.
            fetchSujets();
        } catch (err) {
            setErrorReponses(err.response?.data?.message || "Erreur lors de l'envoi de la réponse, certains mots utilisés ne sont pas autorisés dans la réponse. Veuillez reformuler.");
        }
    };

    const handleEditSujetClick = (sujet) => {
        setEditingSujetId(sujet.id);
        setEditingSujetTitre(sujet.titre);
        setEditingSujetContenu(sujet.contenu);
    };

    const handleUpdateSujet = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!editingSujetTitre.trim() || !editingSujetContenu.trim()) {
            setError("Le titre et le contenu du sujet ne peuvent pas être vides.");
            return;
        }

        try {
            await modifierForumSujet(editingSujetId, editingSujetTitre, editingSujetContenu);
            setSujets(prev => prev.map(s =>
                s.id === editingSujetId ? { ...s, titre: editingSujetTitre, contenu: editingSujetContenu } : s
            ));
            setSuccessMessage("Sujet modifié avec succès !");
            setEditingSujetId(null);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la modification du sujet.");
        }
    };

    const handleDeleteSujet = async (sujetId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce sujet ?")) {
            try {
                await supprimerForumSujet(sujetId);
                setSujets(prev => prev.filter(s => s.id !== sujetId));
                setSuccessMessage("Sujet supprimé avec succès !");
                if (selectedTopic?.id === sujetId) {
                    setSelectedTopic(null);
                    setReponses([]);
                }
                setTimeout(() => setSuccessMessage(null), 3000);
            } catch (err) {
                setError(err.response?.data?.message || "Erreur lors de la suppression du sujet.");
            }
        }
    };

    const handleEditReponseClick = (reponse) => {
        setEditingReponseId(reponse.id);
        setEditingReponseMessage(reponse.message);
    };

    const handleUpdateReponse = async (e) => {
        e.preventDefault();
        setErrorReponses(null);
        setSuccessMessageReponse(null);

        if (!editingReponseMessage.trim()) {
            setErrorReponses("Le message de la réponse ne peut pas être vide.");
            return;
        }

        try {
            await modifierForumReponse(editingReponseId, editingReponseMessage);
            setReponses(prev => prev.map(r =>
                r.id === editingReponseId ? { ...r, message: editingReponseMessage } : r
            ));
            setSuccessMessageReponse("Réponse modifiée avec succès !");
            setEditingReponseId(null);
            setTimeout(() => setSuccessMessageReponse(null), 3000);
        } catch (err) {
            setErrorReponses(err.response?.data?.message || "Erreur lors de la modification de la réponse.");
        }
    };

    const handleDeleteReponse = async (reponseId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réponse ?")) {
            try {
                await supprimerForumReponse(reponseId);
                setReponses(prev => prev.filter(r => r.id !== reponseId));
                setSuccessMessageReponse("Réponse supprimée avec succès !");
                setSujets(prev => prev.map(sujet =>
                    sujet.id === selectedTopic.id
                        ? { ...sujet, reponsesCount: Math.max(0, (sujet.reponsesCount || 0) - 1) }
                        : sujet
                ));
                setTimeout(() => setSuccessMessageReponse(null), 3000);
            } catch (err) {
                setErrorReponses(err.response?.data?.message || "Erreur lors de la suppression de la réponse.");
            }
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10 text-center">
                        <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                            Espace communautaire
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                            Forum Communautaire
                        </h1>
                        <p className="mt-3 text-lg text-slate-500">
                            Échangez, partagez et soutenez-vous dans un espace bienveillant et anonyme.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center">
                            <X className="w-5 h-5 mr-2 shrink-0" />
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center">
                            <Check className="w-5 h-5 mr-2 shrink-0" />
                            {successMessage}
                        </div>
                    )}

                    {selectedTopic ? (
                        <div className="space-y-6">
                            <button
                                onClick={handleBackToList}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Retour aux discussions
                            </button>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                {editingSujetId === selectedTopic.id ? (
                                    <form onSubmit={handleUpdateSujet} className="p-6 space-y-4">
                                        <h2 className="text-xl font-bold text-slate-800">Modifier le sujet</h2>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                                            <input
                                                type="text"
                                                value={editingSujetTitre}
                                                onChange={(e) => setEditingSujetTitre(e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Contenu</label>
                                            <textarea
                                                rows="4"
                                                value={editingSujetContenu}
                                                onChange={(e) => setEditingSujetContenu(e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setEditingSujetId(null)}
                                                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                Enregistrer
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                {getAuthorInitial(selectedTopic.auteur, selectedTopic.anonyme)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center text-sm space-x-2">
                                                    <span className="font-medium text-slate-900 truncate">
                                                        {getAuthorDisplayName(selectedTopic.auteur, selectedTopic.anonyme)}
                                                    </span>
                                                    <span className="text-slate-500 flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {formatRelativeTime(selectedTopic.dateCreation)}
                                                    </span>
                                                </div>
                                                <h2 className="mt-1 text-xl font-bold text-slate-900">
                                                    {selectedTopic.titre}
                                                </h2>
                                                <p className="mt-2 text-slate-600 whitespace-pre-line leading-relaxed">
                                                    {selectedTopic.contenu}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedTopic.auteur && (isAuthor(selectedTopic.auteur.email) || isAdmin()) && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end space-x-4">
                                                <button
                                                    onClick={() => handleEditSujetClick(selectedTopic)}
                                                    className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSujet(selectedTopic.id)}
                                                    className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Supprimer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                                    Réponses ({reponses.length})
                                </h3>

                                {loadingReponses ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </div>
                                ) : reponses.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-slate-100 p-6 text-center text-slate-500">
                                        Aucune réponse pour le moment. Soyez le premier à répondre !
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reponses.map(reponse => (
                                            <div key={reponse.id} className="bg-white rounded-xl shadow-sm border border-slate-100">
                                                {editingReponseId === reponse.id ? (
                                                    <form onSubmit={handleUpdateReponse} className="p-4">
                                                        <textarea
                                                            rows="3"
                                                            value={editingReponseMessage}
                                                            onChange={(e) => setEditingReponseMessage(e.target.value)}
                                                            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            required
                                                        />
                                                        <div className="mt-2 flex justify-end space-x-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingReponseId(null)}
                                                                className="px-3 py-1 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                                                            >
                                                                Annuler
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                            >
                                                                Enregistrer
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div className="p-4">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                                                                {getAuthorInitial(reponse.auteur, reponse.anonyme)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center text-sm space-x-2">
                                                                    <span className="font-medium text-slate-900">
                                                                        {getAuthorDisplayName(reponse.auteur, reponse.anonyme)}
                                                                    </span>
                                                                    <span className="text-slate-500 flex items-center">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        {formatRelativeTime(reponse.dateReponse)}
                                                                    </span>
                                                                </div>
                                                                <p className="mt-1 text-slate-600 whitespace-pre-line leading-relaxed">
                                                                    {reponse.message}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {reponse.auteur && (isAuthor(reponse.auteur.email) || isAdmin()) && (
                                                            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end space-x-4">
                                                                <button
                                                                    onClick={() => handleEditReponseClick(reponse)}
                                                                    className="text-blue-600 hover:text-blue-700 flex items-center text-xs font-medium"
                                                                >
                                                                    <Edit className="w-3 h-3 mr-1" />
                                                                    Modifier
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteReponse(reponse.id)}
                                                                    className="text-red-600 hover:text-red-700 flex items-center text-xs font-medium"
                                                                >
                                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                                    Supprimer
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="bg-white rounded-xl border border-slate-100 p-6">
                                    <h4 className="text-md font-semibold text-slate-900 mb-4">Ajouter une réponse</h4>
                                    {!isAuthenticated ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                            <p className="text-blue-800 mb-3 text-sm">Connectez-vous pour participer à la discussion</p>
                                            
                                                href="/connexion"
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm shadow-blue-600/20"
                                            <a>
                                                <UserCircle2 className="w-4 h-4 mr-2" />
                                                Se connecter
                                            </a>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmitReponse} className="space-y-4">
                                            <textarea
                                                rows="4"
                                                placeholder="Écrivez votre réponse ici..."
                                                value={nouveauMessageReponse}
                                                onChange={(e) => setNouveauMessageReponse(e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            <div className="flex items-center justify-between">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                                        checked={isReponseAnonyme}
                                                        onChange={(e) => setIsReponseAnonyme(e.target.checked)}
                                                    />
                                                    <span className="ml-2 text-sm text-slate-600">Publier anonymement</span>
                                                </label>
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium shadow-sm shadow-blue-600/20"
                                                >
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Envoyer
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                        <Plus className="w-5 h-5 mr-2 text-blue-600" />
                                        Nouvelle discussion
                                    </h2>
                                    {!isAuthenticated ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                            <p className="text-blue-800 mb-3 text-sm">Connectez-vous pour créer une nouvelle discussion</p>
                                            <a
                                                href="/connexion"
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm shadow-blue-600/20"
                                            >
                                                <UserCircle2 className="w-4 h-4 mr-2" />
                                                Se connecter
                                            </a>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmitSujet} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                                                <input
                                                    type="text"
                                                    value={nouveauTitre}
                                                    onChange={(e) => setNouveauTitre(e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Titre de votre discussion"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Contenu</label>
                                                <textarea
                                                    rows="4"
                                                    value={nouveauContenu}
                                                    onChange={(e) => setNouveauContenu(e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Détaillez votre discussion ici..."
                                                    required
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                                        checked={isSujetAnonyme}
                                                        onChange={(e) => setIsSujetAnonyme(e.target.checked)}
                                                    />
                                                    <span className="ml-2 text-sm text-slate-600">Publier anonymement</span>
                                                </label>
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium shadow-sm shadow-blue-600/20"
                                                >
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Publier
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                    <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
                                    Discussions récentes
                                </h2>

                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-4 text-slate-500">Chargement des discussions...</p>
                                    </div>
                                ) : sujets.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
                                        <MessageSquare className="w-10 h-10 mx-auto text-slate-400" />
                                        <h3 className="mt-4 text-lg font-medium text-slate-900">Aucune discussion</h3>
                                        <p className="mt-2 text-slate-500">Soyez le premier à lancer une discussion !</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sujets.map(sujet => (
                                            <div
                                                key={sujet.id}
                                                className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-100 transition-all cursor-pointer"
                                                onClick={() => setSelectedTopic(sujet)}
                                            >
                                                <div className="p-6">
                                                    <div className="flex items-start space-x-4">
                                                        <div className="shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                            {getAuthorInitial(sujet.auteur, sujet.anonyme)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center text-sm space-x-2">
                                                                <span className="font-medium text-slate-900">
                                                                    {getAuthorDisplayName(sujet.auteur, sujet.anonyme)}
                                                                </span>
                                                                <span className="text-slate-500 flex items-center">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {formatRelativeTime(sujet.dateCreation)}
                                                                </span>
                                                            </div>
                                                            <h3 className="mt-1 text-lg font-semibold text-slate-900">
                                                                {sujet.titre}
                                                            </h3>
                                                            <p className="mt-2 text-slate-600 line-clamp-2 leading-relaxed">
                                                                {sujet.contenu}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                                                                <MessageSquare className="w-3.5 h-3.5" />
                                                                {sujet.reponsesCount} réponse{sujet.reponsesCount !== 1 ? 's' : ''}
                                                            </span>
                                                            {sujet.derniereActivite && sujet.reponsesCount > 0 && (
                                                                <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 text-xs font-medium px-3 py-1 rounded-full">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    Dernière activité {formatRelativeTime(sujet.derniereActivite)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {sujet.auteur && (isAuthor(sujet.auteur.email) || isAdmin()) && (
                                                            <div className="flex space-x-4">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditSujetClick(sujet);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
                                                                >
                                                                    <Edit className="w-4 h-4 mr-1" />
                                                                    Modifier
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteSujet(sujet.id);
                                                                    }}
                                                                    className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                                    Supprimer
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Forum;