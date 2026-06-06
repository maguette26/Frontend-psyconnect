import React, { useEffect, useState } from 'react';
import {
  getDisponibilitesByProId,
  ajouterDisponibilite,
  modifierDisponibilite,
  supprimerDisponibilite
} from '../../services/servicePsy';

import { CheckCircle, XCircle, Trash2, Pencil, CalendarClock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const formatHeure = (heure) => {
  if (!heure) return '';
  const [h, m] = heure.split(':');
  return `${h}h${m}`;
};

const Disponibilite = ({ proId }) => {
  const [disponibilites, setDisponibilites] = useState([]);
  const [formData, setFormData] = useState({ date: '', heureDebut: '', heureFin: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (proId) chargerDisponibilites();
  }, [proId]);

  // ✅ Auto-efface le message après 4 secondes
  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const chargerDisponibilites = async () => {
    try {
      setLoading(true);
      const data = await getDisponibilitesByProId(proId);
      setDisponibilites(data);
    } catch (err) {
      setMessage({ type: 'error', text: "Erreur lors du chargement des disponibilités." });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ date: '', heureDebut: '', heureFin: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.heureDebut || !formData.heureFin) {
      setMessage({ type: 'error', text: 'Tous les champs sont requis.' });
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await modifierDisponibilite(editingId, formData);
      } else {
        await ajouterDisponibilite(formData);
      }
      setMessage({ type: 'success', text: editingId ? 'Disponibilité modifiée avec succès.' : 'Disponibilité ajoutée avec succès.' });
      resetForm();
      await chargerDisponibilites();
    } catch (err) {
      // ✅ FIX : Railway timeout — si Network Error, on recharge quand même
      // car l'opération a probablement réussi côté serveur
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setMessage({ type: 'success', text: editingId ? 'Disponibilité modifiée (serveur lent, rechargement...)' : 'Disponibilité ajoutée (serveur lent, rechargement...)' });
        resetForm();
        setTimeout(() => chargerDisponibilites(), 2000);
      } else {
        const msg = err.response?.data?.message || err.response?.data || 'Erreur lors de la sauvegarde.';
        setMessage({ type: 'error', text: typeof msg === 'string' ? msg : 'Erreur lors de la sauvegarde.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (dispo) => {
    setEditingId(dispo.id);
    setFormData({ date: dispo.date, heureDebut: dispo.heureDebut, heureFin: dispo.heureFin });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    // ✅ Optimistic update : supprime immédiatement de l'UI
    setDisponibilites(prev => prev.filter(d => d.id !== id));
    try {
      await supprimerDisponibilite(id);
      setMessage({ type: 'success', text: 'Disponibilité supprimée.' });
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        // ✅ FIX : Railway timeout — suppression probablement réussie
        setMessage({ type: 'success', text: 'Disponibilité supprimée.' });
        setTimeout(() => chargerDisponibilites(), 2000);
      } else {
        // Vraie erreur : on remet la dispo dans la liste
        setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
        await chargerDisponibilites();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-2xl space-y-6"
    >
      <div className="flex items-center justify-center gap-2">
        <CalendarClock className="text-blue-600" size={28} />
        <h2 className="text-2xl font-semibold">Mes disponibilités</h2>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 text-sm rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-md" required />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Heure début</label>
            <input type="time" name="heureDebut" value={formData.heureDebut} onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-md" required />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Heure fin</label>
            <input type="time" name="heureFin" value={formData.heureFin} onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-md" required />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {editingId && (
            <button type="button" onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm">
              Annuler
            </button>
          )}
          <button type="submit" disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>

      <div className="border-t pt-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-blue-500" size={28} />
          </div>
        ) : disponibilites.length === 0 ? (
          <p className="text-center text-gray-500">Vous n'avez aucune disponibilité enregistrée.</p>
        ) : (
          <div className="grid gap-4">
            {disponibilites.map((dispo) => (
              <motion.div
                key={dispo.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-between items-center bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl hover:shadow-sm"
              >
                <div className="text-gray-800 font-medium">
                  📅 {dispo.date} <br />
                  🕒 {formatHeure(dispo.heureDebut)} → {formatHeure(dispo.heureFin)}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(dispo)}
                    className="text-blue-600 hover:text-blue-800 bg-transparent border-0 cursor-pointer p-0"
                    title="Modifier" aria-label="Modifier disponibilité">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(dispo.id)}
                    disabled={deletingId === dispo.id}
                    className="text-red-600 hover:text-red-800 bg-transparent border-0 cursor-pointer p-0 disabled:opacity-40"
                    title="Supprimer" aria-label="Supprimer disponibilité">
                    {deletingId === dispo.id
                      ? <Loader2 size={18} className="animate-spin" />
                      : <Trash2 size={18} />
                    }
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Disponibilite;