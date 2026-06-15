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
  ChevronLeft, Send, Plus, Check, X, Heart, Leaf, Shield
} from 'lucide-react';

/* ─── HELPERS ─────────────────────────────────────────────── */
const getInitial = (author, isAnon) => {
  if (isAnon) return 'A';
  if (author?.prenom) return author.prenom.charAt(0).toUpperCase();
  if (author?.nom) return author.nom.charAt(0).toUpperCase();
  if (author?.email) return author.email.charAt(0).toUpperCase();
  return '?';
};

const getDisplayName = (author, isAnon) => {
  if (isAnon) return 'Membre anonyme';
  if (author?.nom && author?.prenom) return `${author.prenom} ${author.nom}`;
  if (author?.email) return author.email;
  return 'Membre';
};

const relativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = (new Date() - new Date(dateStr)) / 1000;
  if (diff < 60) return `il y a ${Math.floor(diff)}s`;
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `il y a ${Math.floor(diff / 86400)}j`;
  return `il y a ${Math.floor(diff / 2592000)}mois`;
};

/* ─── AVATAR ──────────────────────────────────────────────── */
const Avatar = ({ author, isAnon, size = 'md' }) => {
  const initial = getInitial(author, isAnon);
  const colors = ['#2E7D8C', '#3B8A6E', '#5B6E8C', '#7C5C8C', '#8C6B3E'];
  const idx = initial.charCodeAt(0) % colors.length;
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${sz} rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx + 1) % colors.length]})` }}
    >
      {initial}
    </div>
  );
};

/* ─── BADGE ANONYMOUS ─────────────────────────────────────── */
const AnonBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-600 border border-teal-200">
    <Shield size={9} /> Anonyme
  </span>
);

/* ─── TOAST ───────────────────────────────────────────────── */
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const styles = {
    success: 'bg-teal-50 border-teal-200 text-teal-700',
    error: 'bg-red-50 border-red-200 text-red-600',
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl border shadow-xl text-sm font-medium backdrop-blur-sm ${styles[type] || 'bg-white border-gray-200 text-gray-700'}`}>
      {type === 'success' ? <Check size={15} /> : <X size={15} />}
      {msg}
    </div>
  );
};

/* ─── TOPIC CARD ──────────────────────────────────────────── */
const TopicCard = ({ sujet, onClick, onEdit, onDelete, isAuthorFn, isAdminFn, editingId, editingTitre, editingContenu, setEditingTitre, setEditingContenu, onUpdateSujet, setEditingId }) => {
  const isEditing = editingId === sujet.id;
  return (
    <div
      className="group bg-white rounded-3xl border border-sand-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
      style={{ borderColor: '#EDE8DF' }}
      onClick={isEditing ? undefined : onClick}
    >
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #2E7D8C, #A8D5C2)' }} />

      {isEditing ? (
        <form onSubmit={onUpdateSujet} className="p-6 space-y-4" onClick={e => e.stopPropagation()}>
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Modifier la discussion</h3>
          <input
            value={editingTitre}
            onChange={e => setEditingTitre(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            style={{ borderColor: '#D8D0C4', background: '#FAF8F5' }}
            placeholder="Titre"
            required
          />
          <textarea
            rows={3}
            value={editingContenu}
            onChange={e => setEditingContenu(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
            style={{ borderColor: '#D8D0C4', background: '#FAF8F5' }}
            required
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={e => { e.stopPropagation(); setEditingId(null); }} className="px-4 py-2 rounded-xl text-sm border text-gray-500 hover:bg-gray-50 transition" style={{ borderColor: '#D8D0C4' }}>Annuler</button>
            <button type="submit" onClick={e => e.stopPropagation()} className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition" style={{ background: '#2E7D8C' }}>Enregistrer</button>
          </div>
        </form>
      ) : (
        <div className="p-6">
          <div className="flex gap-4">
            <Avatar author={sujet.auteur} isAnon={sujet.anonyme} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold" style={{ color: '#0F2B3D' }}>
                  {getDisplayName(sujet.auteur, sujet.anonyme)}
                </span>
                {sujet.anonyme && <AnonBadge />}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={11} />{relativeTime(sujet.dateCreation)}
                </span>
              </div>
              <h3 className="text-base font-bold mb-1.5 leading-snug group-hover:text-teal-700 transition-colors" style={{ color: '#0F2B3D' }}>
                {sujet.titre}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{sujet.contenu}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #EDE8DF' }}>
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#2E7D8C' }}>
              <MessageSquare size={13} />
              {sujet.reponsesCount || 0} réponse{sujet.reponsesCount !== 1 ? 's' : ''}
            </span>
            {sujet.auteur && (isAuthorFn(sujet.auteur.email) || isAdminFn()) && (
              <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                <button onClick={() => onEdit(sujet)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal-600 transition">
                  <Edit size={12} /> Modifier
                </button>
                <button onClick={() => onDelete(sujet.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition">
                  <Trash2 size={12} /> Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── REPLY CARD ──────────────────────────────────────────── */
const ReplyCard = ({ reponse, isAuthorFn, isAdminFn, onEdit, onDelete, editingId, editingMsg, setEditingMsg, onUpdate, setEditingId }) => {
  const isEditing = editingId === reponse.id;
  return (
    <div className="bg-white rounded-2xl border shadow-sm" style={{ borderColor: '#EDE8DF' }}>
      {isEditing ? (
        <form onSubmit={onUpdate} className="p-4 space-y-3">
          <textarea
            rows={3}
            value={editingMsg}
            onChange={e => setEditingMsg(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
            style={{ borderColor: '#D8D0C4', background: '#FAF8F5' }}
            required
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs border text-gray-500 hover:bg-gray-50 transition" style={{ borderColor: '#D8D0C4' }}>Annuler</button>
            <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition" style={{ background: '#2E7D8C' }}>Enregistrer</button>
          </div>
        </form>
      ) : (
        <div className="p-4">
          <div className="flex gap-3">
            <Avatar author={reponse.auteur} isAnon={reponse.anonyme} size="sm" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold" style={{ color: '#0F2B3D' }}>
                  {getDisplayName(reponse.auteur, reponse.anonyme)}
                </span>
                {reponse.anonyme && <AnonBadge />}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={10} />{relativeTime(reponse.dateReponse)}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{reponse.message}</p>
            </div>
          </div>
          {reponse.auteur && (isAuthorFn(reponse.auteur.email) || isAdminFn()) && (
            <div className="mt-3 pt-3 flex justify-end gap-3" style={{ borderTop: '1px solid #EDE8DF' }}>
              <button onClick={() => onEdit(reponse)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal-600 transition">
                <Edit size={11} /> Modifier
              </button>
              <button onClick={() => onDelete(reponse.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition">
                <Trash2 size={11} /> Supprimer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── COMPOSANT PRINCIPAL ─────────────────────────────────── */
const Forum = () => {
  const [sujets, setSujets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [nouveauTitre, setNouveauTitre] = useState('');
  const [nouveauContenu, setNouveauContenu] = useState('');
  const [isSujetAnonyme, setIsSujetAnonyme] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [reponses, setReponses] = useState([]);
  const [nouveauMsg, setNouveauMsg] = useState('');
  const [isReponseAnonyme, setIsReponseAnonyme] = useState(false);
  const [loadingReponses, setLoadingReponses] = useState(false);
  const [editingSujetId, setEditingSujetId] = useState(null);
  const [editingSujetTitre, setEditingSujetTitre] = useState('');
  const [editingSujetContenu, setEditingSujetContenu] = useState('');
  const [editingReponseId, setEditingReponseId] = useState(null);
  const [editingReponseMessage, setEditingReponseMessage] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const isAuthor = (email) => isAuthenticated && currentUserEmail === email;
  const isAdmin = () => isAuthenticated && currentUserRole === 'ADMIN';

  const fetchSujets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getForumSujets();
      setSujets(data.map(s => ({ ...s, reponsesCount: parseInt(s.reponsesCount, 10) || 0 })));
    } catch { setError("Impossible de charger les discussions."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    try {
      const info = getCurrentUserInfo();
      if (info?.token) {
        setIsAuthenticated(true);
        setCurrentUserEmail(info.email);
        setCurrentUserRole(info.role);
      }
    } catch {}
    fetchSujets();
  }, [fetchSujets]);

  useEffect(() => {
    if (!selectedTopic?.id) { setReponses([]); return; }
    setLoadingReponses(true);
    getForumReponses(selectedTopic.id)
      .then(setReponses)
      .catch(() => {})
      .finally(() => setLoadingReponses(false));
  }, [selectedTopic]);

  const handleSubmitSujet = async (e) => {
    e.preventDefault();
    if (!nouveauTitre.trim() || !nouveauContenu.trim()) return;
    try {
      const sujet = await creerForumSujet(nouveauTitre, nouveauContenu, isSujetAnonyme);
      setSujets(prev => [{ ...sujet, reponsesCount: 0 }, ...prev]);
      setNouveauTitre(''); setNouveauContenu(''); setIsSujetAnonyme(false);
      setShowNewForm(false);
      showToast('Discussion créée avec succès !');
    } catch (err) {
      showToast(err.response?.data?.message || 'Certains mots ne sont pas autorisés.', 'error');
    }
  };

  const handleSubmitReponse = async (e) => {
    e.preventDefault();
    if (!nouveauMsg.trim()) return;
    try {
      const rep = await envoyerForumReponse(selectedTopic.id, nouveauMsg, isReponseAnonyme);
      setReponses(prev => [...prev, rep]);
      setNouveauMsg(''); setIsReponseAnonyme(false);
      setSelectedTopic(prev => ({ ...prev, reponsesCount: (prev.reponsesCount || 0) + 1 }));
      showToast('Réponse envoyée !');
    } catch (err) {
      showToast(err.response?.data?.message || 'Certains mots ne sont pas autorisés.', 'error');
    }
  };

  const handleUpdateSujet = async (e) => {
    e.preventDefault();
    try {
      await modifierForumSujet(editingSujetId, editingSujetTitre, editingSujetContenu);
      setSujets(prev => prev.map(s => s.id === editingSujetId ? { ...s, titre: editingSujetTitre, contenu: editingSujetContenu } : s));
      setEditingSujetId(null);
      showToast('Discussion modifiée.');
    } catch { showToast('Erreur lors de la modification.', 'error'); }
  };

  const handleDeleteSujet = async (id) => {
    if (!window.confirm('Supprimer cette discussion ?')) return;
    try {
      await supprimerForumSujet(id);
      setSujets(prev => prev.filter(s => s.id !== id));
      if (selectedTopic?.id === id) { setSelectedTopic(null); setReponses([]); }
      showToast('Discussion supprimée.');
    } catch { showToast('Erreur lors de la suppression.', 'error'); }
  };

  const handleUpdateReponse = async (e) => {
    e.preventDefault();
    try {
      await modifierForumReponse(editingReponseId, editingReponseMessage);
      setReponses(prev => prev.map(r => r.id === editingReponseId ? { ...r, message: editingReponseMessage } : r));
      setEditingReponseId(null);
      showToast('Réponse modifiée.');
    } catch { showToast('Erreur lors de la modification.', 'error'); }
  };

  const handleDeleteReponse = async (id) => {
    if (!window.confirm('Supprimer cette réponse ?')) return;
    try {
      await supprimerForumReponse(id);
      setReponses(prev => prev.filter(r => r.id !== id));
      showToast('Réponse supprimée.');
    } catch { showToast('Erreur.', 'error'); }
  };

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        .forum-root { font-family: 'Inter', sans-serif; background: #FAF8F5; min-height: 100vh; }
        .forum-hero { background: linear-gradient(135deg, #0F2B3D 0%, #1A4A5C 50%, #2E7D8C 100%); }
        .display-font { font-family: 'Playfair Display', serif; }
        .wave-divider { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23FAF8F5' d='M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z'/%3E%3C/svg%3E") no-repeat bottom; background-size: 100%; }
        .anoncheck:checked { accent-color: #2E7D8C; }
        .chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
      `}</style>

      <div className="forum-root">
        {/* HERO */}
        <div className="forum-hero wave-divider pb-16 pt-12 px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(168,213,194,0.2)', border: '1px solid rgba(168,213,194,0.3)' }}>
              <Leaf size={12} style={{ color: '#A8D5C2' }} />
              <span style={{ color: '#A8D5C2' }}>Espace communautaire bienveillant</span>
            </div>
            <h1 className="display-font text-4xl md:text-5xl font-bold mb-3 leading-tight">
              Forum d'entraide
            </h1>
            <p className="text-lg mb-6" style={{ color: '#A8D5C2' }}>
              Partagez, écoutez, soutenez — en toute sécurité.
            </p>
            <div className="flex justify-center gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {[['🤝', 'Bienveillance'], ['🔒', 'Confidentialité'], ['💚', 'Sans jugement']].map(([icon, label]) => (
                <span key={label} className="flex items-center gap-1.5">{icon} {label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-16">

          {/* ERREUR GLOBALE */}
          {error && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-red-600 bg-red-50 border border-red-200">
              <X size={15} />{error}
            </div>
          )}

          {/* VUE TOPIC */}
          {selectedTopic ? (
            <div className="space-y-5">
              <button
                onClick={() => { setSelectedTopic(null); setReponses([]); fetchSujets(); }}
                className="flex items-center gap-2 text-sm font-medium transition hover:gap-3"
                style={{ color: '#2E7D8C' }}
              >
                <ChevronLeft size={18} />Retour aux discussions
              </button>

              {/* Sujet principal */}
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden" style={{ border: '1px solid #EDE8DF' }}>
                <div className="h-1" style={{ background: 'linear-gradient(90deg, #2E7D8C, #A8D5C2)' }} />
                {editingSujetId === selectedTopic.id ? (
                  <form onSubmit={handleUpdateSujet} className="p-6 space-y-4">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Modifier</p>
                    <input value={editingSujetTitre} onChange={e => setEditingSujetTitre(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" style={{ borderColor: '#D8D0C4', background: '#FAF8F5' }} required />
                    <textarea rows={4} value={editingSujetContenu} onChange={e => setEditingSujetContenu(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" style={{ borderColor: '#D8D0C4', background: '#FAF8F5' }} required />
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditingSujetId(null)} className="px-4 py-2 rounded-xl text-sm border text-gray-500" style={{ borderColor: '#D8D0C4' }}>Annuler</button>
                      <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#2E7D8C' }}>Enregistrer</button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6">
                    <div className="flex gap-4">
                      <Avatar author={selectedTopic.auteur} isAnon={selectedTopic.anonyme} size="lg" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold" style={{ color: '#0F2B3D' }}>{getDisplayName(selectedTopic.auteur, selectedTopic.anonyme)}</span>
                          {selectedTopic.anonyme && <AnonBadge />}
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{relativeTime(selectedTopic.dateCreation)}</span>
                        </div>
                        <h2 className="display-font text-2xl font-bold mb-3" style={{ color: '#0F2B3D' }}>{selectedTopic.titre}</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{selectedTopic.contenu}</p>
                      </div>
                    </div>
                    {selectedTopic.auteur && (isAuthor(selectedTopic.auteur.email) || isAdmin()) && (
                      <div className="mt-4 pt-4 flex justify-end gap-4" style={{ borderTop: '1px solid #EDE8DF' }}>
                        <button onClick={() => { setEditingSujetId(selectedTopic.id); setEditingSujetTitre(selectedTopic.titre); setEditingSujetContenu(selectedTopic.contenu); }} className="flex items-center gap-1 text-sm text-gray-400 hover:text-teal-600 transition"><Edit size={14} /> Modifier</button>
                        <button onClick={() => handleDeleteSujet(selectedTopic.id)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /> Supprimer</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Réponses */}
              <div>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: '#0F2B3D' }}>
                  <MessageSquare size={16} style={{ color: '#2E7D8C' }} />
                  {reponses.length} réponse{reponses.length !== 1 ? 's' : ''}
                </h3>

                {loadingReponses ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2E7D8C', borderTopColor: 'transparent' }} />
                  </div>
                ) : reponses.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #EDE8DF' }}>
                    <Heart size={28} className="mx-auto mb-2" style={{ color: '#A8D5C2' }} />
                    <p className="text-sm text-gray-500">Soyez le premier à répondre avec bienveillance.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reponses.map(r => (
                      <ReplyCard
                        key={r.id} reponse={r}
                        isAuthorFn={isAuthor} isAdminFn={isAdmin}
                        onEdit={rep => { setEditingReponseId(rep.id); setEditingReponseMessage(rep.message); }}
                        onDelete={handleDeleteReponse}
                        editingId={editingReponseId}
                        editingMsg={editingReponseMessage}
                        setEditingMsg={setEditingReponseMessage}
                        onUpdate={handleUpdateReponse}
                        setEditingId={setEditingReponseId}
                      />
                    ))}
                  </div>
                )}

                {/* Formulaire réponse */}
                <div className="mt-5 bg-white rounded-3xl p-6" style={{ border: '1px solid #EDE8DF' }}>
                  {!isAuthenticated ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">Connectez-vous pour participer.</p>
                      <a href="/connexion" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition" style={{ background: '#2E7D8C' }}>
                        <UserCircle2 size={16} /> Se connecter
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReponse} className="space-y-3">
                      <p className="text-sm font-semibold" style={{ color: '#0F2B3D' }}>Votre réponse</p>
                      <textarea
                        rows={4}
                        placeholder="Partagez votre expérience ou votre soutien..."
                        value={nouveauMsg}
                        onChange={e => setNouveauMsg(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none transition"
                        style={{ borderColor: '#D8D0C4', background: '#FAF8F5' }}
                        required
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                          <input type="checkbox" className="anoncheck rounded" checked={isReponseAnonyme} onChange={e => setIsReponseAnonyme(e.target.checked)} />
                          Répondre anonymement
                        </label>
                        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition active:scale-95" style={{ background: '#2E7D8C' }}>
                          <Send size={14} /> Envoyer
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ─── LISTE DES SUJETS ─── */
            <div className="space-y-6">
              {/* Bouton nouvelle discussion */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="display-font text-2xl font-bold" style={{ color: '#0F2B3D' }}>Discussions</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{sujets.length} sujet{sujets.length !== 1 ? 's' : ''} dans la communauté</p>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowNewForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition active:scale-95 shadow-sm"
                    style={{ background: showNewForm ? '#0F2B3D' : '#2E7D8C' }}
                  >
                    {showNewForm ? <X size={15} /> : <Plus size={15} />}
                    {showNewForm ? 'Annuler' : 'Nouvelle discussion'}
                  </button>
                )}
              </div>

              {/* Formulaire nouvelle discussion */}
              {showNewForm && isAuthenticated && (
                <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #EDE8DF' }}>
                  <h3 className="display-font text-lg font-bold mb-4" style={{ color: '#0F2B3D' }}>Lancer une discussion</h3>
                  <form onSubmit={handleSubmitSujet} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Titre de votre discussion"
                      value={nouveauTitre}
                      onChange={e => setNouveauTitre(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
                      style={{ borderColor: '#D8D0C4', background: '#FAF8F5' }}
                      required
                    />
                    <textarea
                      rows={4}
                      placeholder="Partagez votre vécu, vos questions, vos pensées..."
                      value={nouveauContenu}
                      onChange={e => setNouveauContenu(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none transition"
                      style={{ borderColor: '#D8D0C4', background: '#FAF8F5' }}
                      required
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                        <input type="checkbox" className="anoncheck rounded" checked={isSujetAnonyme} onChange={e => setIsSujetAnonyme(e.target.checked)} />
                        Publier anonymement
                      </label>
                      <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition active:scale-95 shadow-sm" style={{ background: '#2E7D8C' }}>
                        <Send size={14} /> Publier
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!isAuthenticated && (
                <div className="rounded-3xl p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #EBF5F2, #F0F8FF)', border: '1px solid #C8E6DD' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0F2B3D' }}>Rejoignez la conversation</p>
                    <p className="text-xs text-gray-500 mt-0.5">Connectez-vous pour partager et soutenir.</p>
                  </div>
                  <a href="/connexion" className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: '#2E7D8C' }}>
                    <UserCircle2 size={15} /> Se connecter
                  </a>
                </div>
              )}

              {/* Liste */}
              {loading ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2E7D8C', borderTopColor: 'transparent' }} />
                  <p className="text-sm text-gray-400">Chargement des discussions…</p>
                </div>
              ) : sujets.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center" style={{ border: '1px solid #EDE8DF' }}>
                  <MessageSquare size={36} className="mx-auto mb-3" style={{ color: '#A8D5C2' }} />
                  <p className="font-semibold text-gray-600">Aucune discussion pour l'instant</p>
                  <p className="text-sm text-gray-400 mt-1">Soyez le premier à briser la glace.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sujets.map(sujet => (
                    <TopicCard
                      key={sujet.id}
                      sujet={sujet}
                      onClick={() => setSelectedTopic(sujet)}
                      onEdit={s => { setEditingSujetId(s.id); setEditingSujetTitre(s.titre); setEditingSujetContenu(s.contenu); }}
                      onDelete={handleDeleteSujet}
                      isAuthorFn={isAuthor}
                      isAdminFn={isAdmin}
                      editingId={editingSujetId}
                      editingTitre={editingSujetTitre}
                      editingContenu={editingSujetContenu}
                      setEditingTitre={setEditingSujetTitre}
                      setEditingContenu={setEditingSujetContenu}
                      onUpdateSujet={handleUpdateSujet}
                      setEditingId={setEditingSujetId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
};

export default Forum;