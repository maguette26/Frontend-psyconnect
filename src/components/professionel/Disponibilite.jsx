import React, { useEffect, useState } from 'react';
import {
  getDisponibilitesByProId,
  ajouterDisponibilite,
  modifierDisponibilite,
  supprimerDisponibilite
} from '../../services/servicePsy';
import { CheckCircle, XCircle, Trash2, Pencil, CalendarClock, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatHeure = (heure) => {
  if (!heure) return '';
  const [h, m] = heure.split(':');
  return `${h}h${m}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch { return dateStr; }
};

// Vérifie si une dispo est passée
const isPassee = (dispo) => {
  try {
    const [hEnd, mEnd] = dispo.heureFin.split(':').map(Number);
    const fin = new Date(dispo.date);
    fin.setHours(hEnd, mEnd, 0, 0);
    return fin < new Date();
  } catch { return false; }
};

const Disponibilite = ({ proId }) => {
  const [disponibilites, setDisponibilites] = useState([]);
  const [formData, setFormData] = useState({ date: '', heureDebut: '', heureFin: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => { if (proId) chargerDisponibilites(); }, [proId]);

  // Auto-clear message
  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const chargerDisponibilites = async () => {
    try {
      setLoading(true);
      const data = await getDisponibilitesByProId(proId);
      // Trier : à venir d'abord, passées ensuite
      const sorted = [...data].sort((a, b) => {
        const aP = isPassee(a), bP = isPassee(b);
        if (aP !== bP) return aP ? 1 : -1;
        return new Date(a.date) - new Date(b.date);
      });
      setDisponibilites(sorted);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des disponibilités.' });
    } finally { setLoading(false); }
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
    try {
      if (editingId) {
        await modifierDisponibilite(editingId, formData);
        setMessage({ type: 'success', text: 'Disponibilité modifiée avec succès.' });
      } else {
        await ajouterDisponibilite(formData);
        setMessage({ type: 'success', text: 'Disponibilité ajoutée avec succès.' });
      }
      resetForm();
      chargerDisponibilites();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    }
  };

  const handleEdit = (dispo) => {
    setEditingId(dispo.id);
    setFormData({ date: dispo.date, heureDebut: dispo.heureDebut, heureFin: dispo.heureFin });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await supprimerDisponibilite(id);
      setMessage({ type: 'success', text: 'Disponibilité supprimée.' });
      setConfirmDeleteId(null);
      chargerDisponibilites();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
    }
  };

  const aVenir = disponibilites.filter(d => !isPassee(d));
  const passees = disponibilites.filter(d => isPassee(d));

  return (
    <div className="space-y-5 max-w-2xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="text-indigo-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">Mes disponibilités</h2>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm active:scale-95">
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
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORMULAIRE */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 text-base">
                {editingId ? 'Modifier la disponibilité' : 'Nouvelle disponibilité'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required
                    min={new Date().toISOString().split('T')[0]}
                    className="border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Heure début</label>
                  <input type="time" name="heureDebut" value={formData.heureDebut} onChange={handleChange} required
                    className="border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Heure fin</label>
                  <input type="time" name="heureFin" value={formData.heureFin} onChange={handleChange} required
                    className="border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition">
                  Annuler
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm active:scale-95">
                  {editingId ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LISTE */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : disponibilites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
          <CalendarClock className="text-slate-200 mx-auto mb-3" size={36} />
          <p className="text-slate-500 font-medium text-sm">Aucune disponibilité enregistrée.</p>
          <p className="text-slate-400 text-xs mt-1">Cliquez sur « Ajouter » pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* À VENIR */}
          {aVenir.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1">
                À venir · {aVenir.length}
              </p>
              <div className="space-y-2">
                <AnimatePresence>
                  {aVenir.map(dispo => (
                    <DispoCard key={dispo.id} dispo={dispo} onEdit={handleEdit}
                      onDelete={() => setConfirmDeleteId(dispo.id)} passee={false} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* PASSÉES */}
          {passees.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2 px-1">
                Passées · {passees.length}
              </p>
              <div className="space-y-2 opacity-60">
                <AnimatePresence>
                  {passees.map(dispo => (
                    <DispoCard key={dispo.id} dispo={dispo} onEdit={handleEdit}
                      onDelete={() => setConfirmDeleteId(dispo.id)} passee={true} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => setConfirmDeleteId(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="text-red-500" size={22} />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">Supprimer cette disponibilité ?</h3>
                <p className="text-slate-400 text-sm">Cette action est irréversible.</p>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition">
                  Annuler
                </button>
                <button onClick={() => handleDelete(confirmDeleteId)}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition">
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function DispoCard({ dispo, onEdit, onDelete, passee }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
      className={`flex items-center justify-between bg-white border rounded-xl px-4 py-3 transition-all ${
        passee ? 'border-slate-100' : 'border-slate-200 hover:shadow-sm'
      }`}
    >
      <div>
        <p className="font-semibold text-slate-700 text-sm capitalize">
          {formatDate(dispo.date)}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          🕒 {formatHeure(dispo.heureDebut)} → {formatHeure(dispo.heureFin)}
        </p>
      </div>

      {!passee && (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(dispo)}
            className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
            title="Modifier" aria-label="Modifier">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Supprimer" aria-label="Supprimer">
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default Disponibilite;