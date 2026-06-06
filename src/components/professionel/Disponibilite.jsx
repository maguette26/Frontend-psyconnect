import React, { useEffect, useState } from 'react';
import {
  getDisponibilitesByProId,
  ajouterDisponibilite,
  modifierDisponibilite,
  supprimerDisponibilite
} from '../../services/servicePsy';

import { CheckCircle, XCircle, Trash2, Pencil, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';

const formatHeure = (heure) => {
  const [h, m] = heure.split(':');
  return `${h}h${m}`;
};

const Disponibilite = ({ proId }) => {
  const [disponibilites, setDisponibilites] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    heureDebut: '',
    heureFin: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (proId) chargerDisponibilites();
  }, [proId]);

  const chargerDisponibilites = async () => {
    try {
      setLoading(true);
      const data = await getDisponibilitesByProId(proId);
      setDisponibilites(data);
    } catch (err) {
      console.error(err);
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
    try {
      if (!formData.date || !formData.heureDebut || !formData.heureFin) {
        setMessage({ type: 'error', text: 'Tous les champs sont requis.' });
        return;
      }

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
      console.error("Erreur sauvegarde :", err);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    }
  };

  const handleEdit = (dispo) => {
    setEditingId(dispo.id);
    setFormData({
      date: dispo.date,
      heureDebut: dispo.heureDebut,
      heureFin: dispo.heureFin
    });
  };

  const handleDelete = async (id) => {
    try {
      await supprimerDisponibilite(id);
      setMessage({ type: 'success', text: 'Disponibilité supprimée.' });
      chargerDisponibilites();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
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
        <div className={`flex items-center gap-2 p-3 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label htmlFor="date" className="text-sm text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-md"
              required
              placeholder="Sélectionner une date"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="heureDebut" className="text-sm text-gray-700 mb-1">Heure début</label>
            <input
              type="time"
              name="heureDebut"
              value={formData.heureDebut}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-md"
              required
              placeholder="Heure de début"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="heureFin" className="text-sm text-gray-700 mb-1">Heure fin</label>
            <input
              type="time"
              name="heureFin"
              value={formData.heureFin}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-md"
              required
              placeholder="Heure de fin"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>

      <div className="border-t pt-4">
        {  disponibilites.length === 0 ? (
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
                  <button
  onClick={() => handleEdit(dispo)}
  className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-0 p-0 bg-transparent border-0 cursor-pointer"
  title="Modifier"
  aria-label="Modifier disponibilité"
>
  <Pencil size={18} />
</button>
<button
  onClick={() => handleDelete(dispo.id)}
  className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-0 p-0 bg-transparent border-0 cursor-pointer"
  title="Supprimer"
  aria-label="Supprimer disponibilité"
>
  <Trash2 size={18} />
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
