// src/pages/Forum.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/commun/Layout';
import { getCurrentUserInfo } from '../services/serviceAuth';
import {
    getForumSujets, creerForumSujet, getForumReponses,
    envoyerForumReponse, modifierForumSujet, supprimerForumSujet,
    modifierForumReponse, supprimerForumReponse
} from '../services/serviceUtilisateur';
import {
    MessageSquare, Clock, UserCircle2, Edit, Trash2,
    ChevronLeft, Send, Plus, Check, X, Flame
} from 'lucide-react';

const getAuthorInitial = (author, isAnonymous) => {
    if (isAnonymous) return 'A';
    if (author?.nom) return author.nom.charAt(0).toUpperCase();
    if (author?.prenom) return author.prenom.charAt(0).toUpperCase();
    if (author?.email) return author.email.charAt(0).toUpperCase();
    return '?';
};

const formatRelativeTime = (dateTimeString) => {
    if (!dateTimeString) return 'Date inconnue';
    const date = new Date(dateTimeString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `il y a ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `il y a ${days}j`;
    const months = Math.floor(days / 30);
    if (months < 12) return `il y a ${months}mois`;
    return `il y a ${Math.floor(months / 12)}an(s)`;
};

// ── Composant Avatar ──────────────────────────────────────────────
const Avatar = ({ author, isAnonymous, size = 'md', color = 'indigo' }) => {
    const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
    const colors = {
        indigo: 'bg-indigo-100 text-indigo-700',
        orange: 'bg-orange-100 text-orange-700',
        purple: 'bg-purple-100 text-purple-700',
    };
    return (
        <div className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${sizes[size]} ${colors[color]}`}>
            {getAuthorInitial(author, isAnonymous)}
        </div>
    );
};

// ── Composant Badge ────────────────────────────────────────────────
const Badge = ({ count }) => (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
        <MessageSquare className="w-3 h-3" />
        {count} rép.
    </span>
);

// ── Alerte ─────────────────────────────────────────────────────────
const Alert = ({ type, message }) => {
    if (!message) return null;
    const styles = {
        error: 'bg-red-50 text-red-700 border-red-200',
        success: 'bg-green-50 text-green-700 border-green-200',
    };
    const Icon = type === 'error' ? X : Check;
    return (
        <div className={`mb-4 p-3 rounded-xl border flex items-center gap-2 text-sm ${styles[type]}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {message}
        </div>
    );
};

// ── Bouton principal ───────────────────────────────────────────────
const PrimaryBtn = ({ children, onClick, type = 'button', className = '' }) => (
    <button
        type={type}
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 active:scale-95 transition ${className}`}
    >
        {children}
    </button>
);

const SecondaryBtn = ({ children, onClick, type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 active:scale-95 transition"
    >
        {children}
    </button>
);

// ── CheckBox Anonyme ───────────────────────────────────────────────
const AnonCheck = ({ checked, onChange }) => (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            checked={checked}
            onChange={onChange}
        />
        <span className="text-sm text-gray-500">Anonyme</span>
    </label>
);

// ══════════════════════════════════════════════════════════════════
const Forum = () => {
    const [sujets, setSujets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [nouveauTitre, setNouveauTitre] = useState('');
    const [nouveauContenu, setNouveauContenu] = useState('');
    const [isSujetAnonyme, setIsSujetAnonyme] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
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

    const isAuthor = (authorEmail) => isAuthenticated && currentUserEmail === authorEmail;
    const isAdmin = () => isAuthenticated && currentUserRole === 'ADMIN';

    const flash = (setter, msg) => {
        setter(msg);
        setTimeout(() => setter(null), 3000);
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

    const fetchSujets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getForumSujets();
            setSujets(data.map(s => ({ ...s, reponsesCount: parseInt(s.reponsesCount, 10) || 0 })));
        } catch {
            setError("Impossible de charger les sujets du forum.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchAuthStatus = async () => {
            try {
                const profilData = getCurrentUserInfo();
                if (profilData?.token) {
                    setIsAuthenticated(true);
                    setCurrentUserEmail(profilData.email);
                    setCurrentUserRole(profilData.role);
                } else {
                    setIsAuthenticated(false);
                }
            } catch {
                setIsAuthenticated(false);
            }
        };
        fetchAuthStatus();
        fetchSujets();
    }, [fetchSujets]);

    useEffect(() => {
        if (!selectedTopic?.id) { setReponses([]); return; }
        setLoadingReponses(true);
        getForumReponses(selectedTopic.id)
            .then(setReponses)
            .catch(() => setErrorReponses("Impossible de charger les réponses."))
            .finally(() => setLoadingReponses(false));
    }, [selectedTopic]);

    const handleSubmitSujet = async (e) => {
        e.preventDefault();
        if (!nouveauTitre.trim() || !nouveauContenu.trim()) return setError("Titre et contenu obligatoires.");
        if (!isAuthenticated) return setError("Connectez-vous pour créer un sujet.");
        try {
            const s = await creerForumSujet(nouveauTitre, nouveauContenu, isSujetAnonyme);
            setSujets(prev => [{ ...s, reponsesCount: 0 }, ...prev]);
            setNouveauTitre(''); setNouveauContenu(''); setIsSujetAnonyme(false);
            setShowNewForm(false);
            flash(setSuccessMessage, "Sujet créé avec succès !");
        } catch (err) {
            setError(err.response?.data?.message || "Certains mots ne sont pas autorisés.");
        }
    };

    const handleSubmitReponse = async (e) => {
        e.preventDefault();
        if (!nouveauMessageReponse.trim()) return setErrorReponses("Message vide.");
        if (!isAuthenticated) return setErrorReponses("Connectez-vous pour répondre.");
        try {
            const r = await envoyerForumReponse(selectedTopic.id, nouveauMessageReponse, isReponseAnonyme);
            setReponses(prev => [...prev, r]);
            setNouveauMessageReponse(''); setIsReponseAnonyme(false);
            flash(setSuccessMessageReponse, "Réponse envoyée !");
            setSelectedTopic(prev => ({ ...prev, reponsesCount: (prev.reponsesCount || 0) + 1 }));
            fetchSujets();
        } catch (err) {
            setErrorReponses(err.response?.data?.message || "Certains mots ne sont pas autorisés.");
        }
    };

    const handleUpdateSujet = async (e) => {
        e.preventDefault();
        if (!editingSujetTitre.trim() || !editingSujetContenu.trim()) return setError("Champs obligatoires.");
        try {
            await modifierForumSujet(editingSujetId, editingSujetTitre, editingSujetContenu);
            setSujets(prev => prev.map(s => s.id === editingSujetId ? { ...s, titre: editingSujetTitre, contenu: editingSujetContenu } : s));
            flash(setSuccessMessage, "Sujet modifié !");
            setEditingSujetId(null);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur de modification.");
        }
    };

    const handleDeleteSujet = async (sujetId) => {
        if (!window.confirm("Supprimer ce sujet ?")) return;
        try {
            await supprimerForumSujet(sujetId);
            setSujets(prev => prev.filter(s => s.id !== sujetId));
            if (selectedTopic?.id === sujetId) { setSelectedTopic(null); setReponses([]); }
            flash(setSuccessMessage, "Sujet supprimé !");
        } catch (err) {
            setError(err.response?.data?.message || "Erreur de suppression.");
        }
    };

    const handleUpdateReponse = async (e) => {
        e.preventDefault();
        if (!editingReponseMessage.trim()) return setErrorReponses("Message vide.");
        try {
            await modifierForumReponse(editingReponseId, editingReponseMessage);
            setReponses(prev => prev.map(r => r.id === editingReponseId ? { ...r, message: editingReponseMessage } : r));
            flash(setSuccessMessageReponse, "Réponse modifiée !");
            setEditingReponseId(null);
        } catch (err) {
            setErrorReponses(err.response?.data?.message || "Erreur de modification.");
        }
    };

    const handleDeleteReponse = async (reponseId) => {
        if (!window.confirm("Supprimer cette réponse ?")) return;
        try {
            await supprimerForumReponse(reponseId);
            setReponses(prev => prev.filter(r => r.id !== reponseId));
            setSujets(prev => prev.map(s =>
                s.id === selectedTopic.id ? { ...s, reponsesCount: Math.max(0, (s.reponsesCount || 0) - 1) } : s
            ));
            flash(setSuccessMessageReponse, "Réponse supprimée !");
        } catch (err) {
            setErrorReponses(err.response?.data?.message || "Erreur de suppression.");
        }
    };

    // ── Vue Détail Sujet ────────────────────────────────────────────
    const TopicDetail = () => (
        <div className="space-y-4">
            {/* Bouton retour */}
            <button
                onClick={handleBackToList}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition"
            >
                <ChevronLeft className="w-4 h-4" />
                Retour aux discussions
            </button>

            <Alert type="error" message={errorReponses} />
            <Alert type="success" message={successMessageReponse} />

            {/* Carte sujet principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {editingSujetId === selectedTopic.id ? (
                    <form onSubmit={handleUpdateSujet} className="p-4 space-y-3">
                        <p className="font-semibold text-gray-800">Modifier le sujet</p>
                        <input
                            type="text"
                            value={editingSujetTitre}
                            onChange={e => setEditingSujetTitre(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Titre"
                            required
                        />
                        <textarea
                            rows="4"
                            value={editingSujetContenu}
                            onChange={e => setEditingSujetContenu(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        <div className="flex justify-end gap-2">
                            <SecondaryBtn onClick={() => setEditingSujetId(null)}>Annuler</SecondaryBtn>
                            <PrimaryBtn type="submit"><Check className="w-4 h-4" /> Enregistrer</PrimaryBtn>
                        </div>
                    </form>
                ) : (
                    <div className="p-4 sm:p-6">
                        {/* En-tête auteur */}
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar author={selectedTopic.auteur} isAnonymous={selectedTopic.anonyme} size="md" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {getAuthorDisplayName(selectedTopic.auteur, selectedTopic.anonyme)}
                                </p>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatRelativeTime(selectedTopic.dateCreation)}
                                </p>
                            </div>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            {selectedTopic.titre}
                        </h2>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                            {selectedTopic.contenu}
                        </p>
                        {selectedTopic.auteur && (isAuthor(selectedTopic.auteur.email) || isAdmin()) && (
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-4">
                                <button onClick={() => { setEditingSujetTitre(selectedTopic.titre); setEditingSujetContenu(selectedTopic.contenu); setEditingSujetId(selectedTopic.id); }}
                                    className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1 text-xs">
                                    <Edit className="w-3.5 h-3.5" /> Modifier
                                </button>
                                <button onClick={() => handleDeleteSujet(selectedTopic.id)}
                                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs">
                                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Section réponses */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 px-1">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    {reponses.length} réponse{reponses.length !== 1 ? 's' : ''}
                </h3>

                {loadingReponses ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                ) : reponses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
                        Aucune réponse pour le moment. Soyez le premier !
                    </div>
                ) : (
                    reponses.map((reponse, idx) => (
                        <div key={reponse.id} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            {editingReponseId === reponse.id ? (
                                <form onSubmit={handleUpdateReponse} className="p-4 space-y-2">
                                    <textarea
                                        rows="3"
                                        value={editingReponseMessage}
                                        onChange={e => setEditingReponseMessage(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    <div className="flex justify-end gap-2">
                                        <SecondaryBtn onClick={() => setEditingReponseId(null)}>Annuler</SecondaryBtn>
                                        <PrimaryBtn type="submit"><Check className="w-3.5 h-3.5" /> Enregistrer</PrimaryBtn>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar author={reponse.auteur} isAnonymous={reponse.anonyme} size="sm" color="orange" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {getAuthorDisplayName(reponse.auteur, reponse.anonyme)}
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {formatRelativeTime(reponse.dateReponse)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                                {reponse.message}
                                            </p>
                                        </div>
                                    </div>
                                    {reponse.auteur && (isAuthor(reponse.auteur.email) || isAdmin()) && (
                                        <div className="mt-3 pt-2 border-t border-gray-50 flex justify-end gap-4">
                                            <button onClick={() => { setEditingReponseId(reponse.id); setEditingReponseMessage(reponse.message); }}
                                                className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1 text-xs">
                                                <Edit className="w-3 h-3" /> Modifier
                                            </button>
                                            <button onClick={() => handleDeleteReponse(reponse.id)}
                                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs">
                                                <Trash2 className="w-3 h-3" /> Supprimer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* Formulaire réponse */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <p className="text-sm font-semibold text-gray-800 mb-3">Ajouter une réponse</p>
                    {!isAuthenticated ? (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                            <p className="text-indigo-700 text-sm mb-3">Connectez-vous pour participer</p>
                            <a href="/connexion" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition">
                                <UserCircle2 className="w-4 h-4" /> Se connecter
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitReponse} className="space-y-3">
                            <textarea
                                rows="3"
                                placeholder="Écrivez votre réponse..."
                                value={nouveauMessageReponse}
                                onChange={e => setNouveauMessageReponse(e.target.value)}
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                required
                            />
                            <div className="flex items-center justify-between">
                                <AnonCheck checked={isReponseAnonyme} onChange={e => setIsReponseAnonyme(e.target.checked)} />
                                <PrimaryBtn type="submit">
                                    <Send className="w-3.5 h-3.5" /> Envoyer
                                </PrimaryBtn>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );

    // ── Vue Liste Sujets ────────────────────────────────────────────
    const TopicList = () => (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Forum</h1>
                    <p className="text-sm text-gray-400">Échangez avec la communauté</p>
                </div>
                {isAuthenticated && (
                    <button
                        onClick={() => setShowNewForm(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 active:scale-95 transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nouveau</span>
                    </button>
                )}
            </div>

            <Alert type="error" message={error} />
            <Alert type="success" message={successMessage} />

            {/* Formulaire nouveau sujet (accordéon) */}
            {showNewForm && isAuthenticated && (
                <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                    <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                        <p className="text-sm font-semibold text-indigo-800">Nouvelle discussion</p>
                    </div>
                    <form onSubmit={handleSubmitSujet} className="p-4 space-y-3">
                        <input
                            type="text"
                            value={nouveauTitre}
                            onChange={e => setNouveauTitre(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Titre de votre discussion"
                            required
                        />
                        <textarea
                            rows="4"
                            value={nouveauContenu}
                            onChange={e => setNouveauContenu(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            placeholder="Décrivez votre sujet..."
                            required
                        />
                        <div className="flex items-center justify-between">
                            <AnonCheck checked={isSujetAnonyme} onChange={e => setIsSujetAnonyme(e.target.checked)} />
                            <div className="flex gap-2">
                                <SecondaryBtn onClick={() => setShowNewForm(false)}>Annuler</SecondaryBtn>
                                <PrimaryBtn type="submit"><Send className="w-3.5 h-3.5" /> Publier</PrimaryBtn>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {!isAuthenticated && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
                    <p className="text-indigo-700 text-sm mb-3">Connectez-vous pour participer aux discussions</p>
                    <a href="/connexion" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition">
                        <UserCircle2 className="w-4 h-4" /> Se connecter
                    </a>
                </div>
            )}

            {/* Liste sujets */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" /> Discussions récentes
                </h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-indigo-600" />
                    </div>
                ) : sujets.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                        <MessageSquare className="w-9 h-9 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-400 text-sm">Aucune discussion pour le moment.</p>
                    </div>
                ) : (
                    sujets.map(sujet => (
                        <div
                            key={sujet.id}
                            onClick={() => setSelectedTopic(sujet)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md active:scale-[0.99] transition cursor-pointer"
                        >
                            {/* Mode édition inline */}
                            {editingSujetId === sujet.id ? (
                                <form onSubmit={handleUpdateSujet} className="p-4 space-y-3" onClick={e => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        value={editingSujetTitre}
                                        onChange={e => setEditingSujetTitre(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    <textarea
                                        rows="3"
                                        value={editingSujetContenu}
                                        onChange={e => setEditingSujetContenu(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                                        required
                                    />
                                    <div className="flex justify-end gap-2">
                                        <SecondaryBtn onClick={() => setEditingSujetId(null)}>Annuler</SecondaryBtn>
                                        <PrimaryBtn type="submit"><Check className="w-3.5 h-3.5" /> Enregistrer</PrimaryBtn>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar author={sujet.auteur} isAnonymous={sujet.anonyme} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <span className="text-sm font-medium text-gray-800 truncate">
                                                    {getAuthorDisplayName(sujet.auteur, sujet.anonyme)}
                                                </span>
                                                <Badge count={sujet.reponsesCount} />
                                            </div>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                                                <Clock className="w-3 h-3" />
                                                {formatRelativeTime(sujet.dateCreation)}
                                            </p>
                                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 leading-snug">
                                                {sujet.titre}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                                {sujet.contenu}
                                            </p>
                                        </div>
                                    </div>
                                    {sujet.auteur && (isAuthor(sujet.auteur.email) || isAdmin()) && (
                                        <div className="mt-3 pt-2 border-t border-gray-50 flex justify-end gap-4" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => { setEditingSujetId(sujet.id); setEditingSujetTitre(sujet.titre); setEditingSujetContenu(sujet.contenu); }}
                                                className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1 text-xs"
                                            >
                                                <Edit className="w-3 h-3" /> Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSujet(sujet.id)}
                                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs"
                                            >
                                                <Trash2 className="w-3 h-3" /> Supprimer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-5 px-3 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {selectedTopic ? <TopicDetail /> : <TopicList />}
                </div>
            </div>
        </Layout>
    );
};

export default Forum;