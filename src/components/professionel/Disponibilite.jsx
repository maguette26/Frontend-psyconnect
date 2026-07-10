import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  getDisponibilitesByProId,
  ajouterDisponibilite,
  modifierDisponibilite,
  supprimerDisponibilite
} from '../../services/servicePsy';
import {
  CheckCircle, XCircle, Trash2, Pencil, CalendarClock,
  Plus, X, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── HELPERS ────────────────────────────────────────────────────── */
const formatHeure = (h) => {
  if (!h) return '';
  const [hh, mm] = h.split(':');
  return `${hh}h${mm}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch { return dateStr; }
};

const isPassee = (dispo) => {
  try {
    const [hEnd, mEnd] = dispo.heureFin.split(':').map(Number);
    const fin = new Date(dispo.date);
    fin.setHours(hEnd, mEnd, 0, 0);
    return fin < new Date();
  } catch { return false; }
};

/* ─── BARRE DE PROGRESSION ───────────────────────────────────────── */
function ProgressBar({ active }) {
  if (!active) return null;
  return (
    <div className="h-0.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-indigo-500 rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: '85%' }}
        transition={{ duration: 12, ease: 'easeOut' }}
      />
    </div>
  );
}

/* ─── CONFIRM MODAL via portal ───────────────────────────────────── */
function ConfirmModal({ open, onCancel, onConfirm, deleting }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
      onClick={() => !deleting && onCancel()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Barre de progression pendant suppression */}
        <ProgressBar active={deleting} />

        <div className="p-5 sm:p-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {deleting
                ? <Loader2 className="text-red-500 animate-spin" size={22} />
                : <Trash2 className="text-red-500" size={22} />
              }
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-1">Supprimer cette disponibilité ?</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              {deleting ? 'Suppression en cours…' : 'Cette action est irréversible.'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition disabled:opacity-40"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting ? <><Loader2 size={14} className="animate-spin" /> Suppression…</> : 'Supprimer'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

/* ─── DISPO CARD ─────────────────────────────────────────────────── */
function DispoCard({ dispo, onEdit, onDelete, passee, saving }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 bg-white border rounded-xl px-3 sm:px-4 py-3 transition-all overflow-hidden ${
        passee ? 'border-slate-100' : 'border-slate-200 hover:shadow-sm'
      }`}
    >
      {/* Barre de progression si cette card est en cours de sauvegarde */}
      {saving && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full bg-indigo-400"
            initial={{ width: '0%' }}
            animate={{ width: '90%' }}
            transition={{ duration: 15, ease: 'easeOut' }}
          />
        </div>
      )}

      <div className="min-w-0">
        <p className="font-semibold text-slate-700 text-sm capitalize truncate">
          {formatDate(dispo.date)}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p className="text-xs text-slate-400">
            🕒 {formatHeure(dispo.heureDebut)} → {formatHeure(dispo.heureFin)}
          </p>
          {saving && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-0.5">
              <Loader2 size={9} className="animate-spin" />
              En cours…
            </span>
          )}
        </div>
      </div>

      {!passee && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onEdit(dispo)}
            disabled={saving}
            className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition disabled:opacity-30"
            title="Modifier"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            disabled={saving}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30"
            title="Supprimer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ─── COMPOSANT PRINCIPAL ────────────────────────────────────────── */
const Disponibilite = ({ proId }) => {
  const [disponibilites, setDisponibilites] = useState([]);
  const [formData, setFormData]             = useState({ date: '', heureDebut: '', heureFin: '' });
  const [editingId, setEditingId]           = useState(null);
  const [message, setMessage]               = useState({ type: '', text: '' });
  const [loading, setLoading]               = useState(false);
  const [showForm, setShowForm]             = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // États de chargement spécifiques
  const [formSubmitting, setFormSubmitting] = useState(false);   // submit formulaire
  const [deletingId, setDeletingId]         = useState(null);    // suppression en cours

  useEffect(() => { if (proId) chargerDisponibilites(); }, [proId]);

  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const chargerDisponibilites = async () => {
    try {
      setLoading(true);
      const data = await getDisponibilitesByProId(proId);
      const sorted = [...data].sort((a, b) => {
        const aP = isPassee(a), bP = isPassee(b);
        if (aP !== bP) return aP ? 1 : -1;
        return new Date(a.date) - new Date(b.date);
      });
      setDisponibilites(sorted);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des disponibilités.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ date: '', heureDebut: '', heureFin: '' });
    setShowForm(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.heureDebut || !formData.heureFin) {
      setMessage({ type: 'error', text: 'Tous les champs sont requis.' });
      return;
    }
    if (formData.heureDebut >= formData.heureFin) {
      setMessage({ type: 'error', text: "L'heure de fin doit être après l'heure de début." });
      return;
    }

    setFormSubmitting(true);

    try {
      if (editingId) {
        await modifierDisponibilite(editingId, formData);
      } else {
        await ajouterDisponibilite(formData);
      }

      setMessage({ type: 'success', text: editingId ? 'Disponibilité modifiée.' : 'Disponibilité ajoutée.' });
      resetForm();
      chargerDisponibilites();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur lors de la sauvegarde.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (dispo) => {
    setEditingId(dispo.id);
    setFormData({ date: dispo.date, heureDebut: dispo.heureDebut, heureFin: dispo.heureFin });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;

    setDeletingId(id);

    try {
      await supprimerDisponibilite(id);
      setMessage({ type: 'success', text: 'Disponibilité supprimée.' });
      setConfirmDeleteId(null);
      await new Promise(r => setTimeout(r, 0)); // flush avant mutation liste
      chargerDisponibilites();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur lors de la suppression.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  const aVenir  = disponibilites.filter(d => !isPassee(d));
  const passees = disponibilites.filter(d =>  isPassee(d));

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-2xl mx-auto px-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarClock className="text-indigo-600 shrink-0" size={22} />
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">Mes disponibilités</h2>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm active:scale-95 shrink-0"
          >
            <Plus size={15} />
            Ajouter
          </button>
        )}
      </div>

      {/* MESSAGE */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm border break-words ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={16} className="shrink-0" /> : <XCircle size={16} className="shrink-0" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORMULAIRE */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Barre de progression pendant submit */}
            <ProgressBar active={formSubmitting} />

            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700 text-sm sm:text-base">
                  {editingId ? 'Modifier la disponibilité' : 'Nouvelle disponibilité'}
                </h3>
                <button
                  onClick={resetForm}
                  disabled={formSubmitting}
                  className="text-slate-400 hover:text-slate-600 transition disabled:opacity-30"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { label: 'Date',        name: 'date',      type: 'date', min: new Date().toISOString().split('T')[0] },
                    { label: 'Heure début', name: 'heureDebut',type: 'time' },
                    { label: 'Heure fin',   name: 'heureFin',  type: 'time' },
                  ].map(({ label, name, type, min }) => (
                    <div key={name} className="flex flex-col">
                      <label className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required
                        min={min}
                        disabled={formSubmitting}
                        className="border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition disabled:opacity-50 w-full"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={formSubmitting}
                    className="px-4 py-2.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition disabled:opacity-40 order-2 sm:order-1"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    {formSubmitting
                      ? <><Loader2 size={13} className="animate-spin" /> En cours…</>
                      : editingId ? 'Enregistrer' : 'Ajouter'
                    }
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LISTE */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : disponibilites.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-slate-200 border-dashed px-4">
          <CalendarClock className="text-slate-200 mx-auto mb-3" size={34} />
          <p className="text-slate-500 font-medium text-sm">Aucune disponibilité enregistrée.</p>
          <p className="text-slate-400 text-xs mt-1">Cliquez sur « Ajouter » pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {aVenir.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1">
                À venir · {aVenir.length}
              </p>
              <div className="space-y-2">
                <AnimatePresence>
                  {aVenir.map(dispo => (
                    <DispoCard
                      key={dispo.id}
                      dispo={dispo}
                      onEdit={handleEdit}
                      onDelete={() => setConfirmDeleteId(dispo.id)}
                      passee={false}
                      saving={deletingId === dispo.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {passees.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2 px-1">
                Passées · {passees.length}
              </p>
              <div className="space-y-2 opacity-60">
                <AnimatePresence>
                  {passees.map(dispo => (
                    <DispoCard
                      key={dispo.id}
                      dispo={dispo}
                      onEdit={handleEdit}
                      onDelete={() => setConfirmDeleteId(dispo.id)}
                      passee={true}
                      saving={false}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>
      )}

      {/* CONFIRM DELETE — portal pour éviter conflits DOM */}
      <AnimatePresence>
        {confirmDeleteId && (
          <ConfirmModal
            open={!!confirmDeleteId}
            onCancel={() => !deletingId && setConfirmDeleteId(null)}
            onConfirm={handleDelete}
            deleting={!!deletingId}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Disponibilite;