import React, { useEffect, useState } from 'react';
import {
  Smile, Meh, Frown, Zap, AlertCircle, Activity,
  Star, Coffee, TrendingUp, Trash2, Edit2
} from 'lucide-react';
import {
  getSuiviHumeur,
  ajouterHumeur,
  modifierHumeur,
  supprimerHumeur
} from '../../services/serviceUtilisateur';
import { motion } from 'framer-motion';

const moodsList = [
  { label: 'Heureux', Icon: Smile, color: 'text-yellow-500' },
  { label: 'Neutre', Icon: Meh, color: 'text-gray-400' },
  { label: 'Triste', Icon: Frown, color: 'text-blue-500' },
  { label: 'En colère', Icon: Zap, color: 'text-red-500' },
  { label: 'Anxieux', Icon: AlertCircle, color: 'text-purple-500' },
  { label: 'Stressé', Icon: Activity, color: 'text-pink-500' },
  { label: 'Enthousiaste', Icon: Star, color: 'text-yellow-600' },
  { label: 'Fatigué', Icon: Coffee, color: 'text-indigo-600' },
  { label: 'Motivé', Icon: TrendingUp, color: 'text-green-500' },
];

const SuiviHumeur = ({ currentUser }) => {
  const [humeurs, setHumeurs] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  const [messageFlash, setMessageFlash] = useState(null);
  const [humeurDuJour, setHumeurDuJour] = useState(null);
  const [modeEdition, setModeEdition] = useState(false);
  const [editionNotes, setEditionNotes] = useState('');
  const [afficherHistorique, setAfficherHistorique] = useState(false);

  const isUserAuthenticated = !!currentUser?.id;

  useEffect(() => {
    if (messageFlash) {
      const timer = setTimeout(() => setMessageFlash(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [messageFlash]);

  useEffect(() => {
    const chargerHumeurs = async () => {
      if (!isUserAuthenticated) return;
      try {
        const data = await getSuiviHumeur();
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHumeurs(sorted);
        const today = new Date().toISOString().split('T')[0];
        const humeurToday = sorted.find(h => h.date === today);
        if (humeurToday) {
          setHumeurDuJour(humeurToday);
          setEditionNotes(humeurToday.noteJournal || '');
        }
      } catch {
        setMessageFlash({ type: 'error', text: "Impossible de charger l'historique des humeurs." });
      }
    };
    chargerHumeurs();
  }, [isUserAuthenticated]);

  const handleEnregistrer = async (e) => {
    e.preventDefault();
    if (!selectedMood) return setMessageFlash({ type: 'error', text: "Veuillez sélectionner une humeur." });
    try {
      const added = await ajouterHumeur({
        date: new Date().toISOString().split('T')[0],
        etat: selectedMood,
        noteJournal: notes.trim(),
      });
      const newHumeurs = [added, ...humeurs].sort((a, b) => new Date(b.date) - new Date(a.date));
      setHumeurs(newHumeurs);
      setHumeurDuJour(added);
      setSelectedMood('');
      setNotes('');
      setMessageFlash({ type: 'success', text: "Humeur ajoutée avec succès !" });
    } catch {
      setMessageFlash({ type: 'error', text: "Erreur lors de l'enregistrement." });
    }
  };

  const handleModifier = async () => {
    try {
      const updated = await modifierHumeur(humeurDuJour.id, {
        etat: humeurDuJour.etat,
        noteJournal: editionNotes.trim(),
        date: humeurDuJour.date,
      });
      const newHumeurs = humeurs.map(h => (h.id === humeurDuJour.id ? updated : h)).sort((a, b) => new Date(b.date) - new Date(a.date));
      setHumeurs(newHumeurs);
      setHumeurDuJour(updated);
      setModeEdition(false);
      setMessageFlash({ type: 'success', text: "Journal mis à jour." });
    } catch {
      setMessageFlash({ type: 'error', text: "Erreur lors de la modification." });
    }
  };

  const handleSupprimer = async () => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await supprimerHumeur(humeurDuJour.id);
      setHumeurs(prev => prev.filter(h => h.id !== humeurDuJour.id));
      setHumeurDuJour(null);
      setEditionNotes('');
      setMessageFlash({ type: 'success', text: "Humeur supprimée." });
    } catch {
      setMessageFlash({ type: 'error', text: "Erreur lors de la suppression." });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-tr from-indigo-100 via-indigo-50 to-white rounded-3xl shadow-lg">
      <h2 className="text-4xl font-extrabold text-center text-indigo-800 mb-10">
        Suivi de votre humeur
      </h2>

      {messageFlash && (
        <div className={`px-6 py-3 rounded-lg mb-6 shadow-md transition-all ${
          messageFlash.type === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {messageFlash.text}
        </div>
      )}

      {!humeurDuJour && (
        <form onSubmit={handleEnregistrer} className="bg-white p-6 rounded-xl shadow-md space-y-6">
          <h3 className="text-xl font-semibold text-indigo-700">Votre humeur aujourd'hui :</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {moodsList.map(({ label, Icon, color }) => {
              const isSelected = selectedMood === label;
              return (
                <motion.button
                  key={label}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  layout
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium transition duration-200
                    ${isSelected
                      ? 'bg-indigo-700 text-white border-indigo-700 ring-2 ring-indigo-400'
                      : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-100'}
                  `}
                  onClick={() => setSelectedMood(label)}
                  disabled={!isUserAuthenticated}
                >
                  <Icon size={20} className={`${isSelected ? 'text-white' : color}`} />
                  {label}
                </motion.button>
              );
            })}
          </div>
          <textarea
            placeholder="Écrivez vos pensées, événements marquants, etc."
            className="w-full p-4 border border-indigo-300 rounded-xl focus:ring-indigo-400 resize-y"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-700 text-white rounded-full font-bold hover:bg-indigo-800 transition"
              disabled={!isUserAuthenticated}
            >
              Enregistrer mon humeur
            </button>
          </div>
        </form>
      )}

      {humeurDuJour && (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6 mt-6">
          <h3 className="text-xl font-semibold text-indigo-700">
            Humeur du {new Date(humeurDuJour.date).toLocaleDateString()}
          </h3>
          <div className="flex items-center gap-4">
            {React.createElement(
              moodsList.find(m => m.label === humeurDuJour.etat)?.Icon || Smile,
              { size: 28, className: moodsList.find(m => m.label === humeurDuJour.etat)?.color }
            )}
            <p className="text-2xl font-bold text-indigo-800">{humeurDuJour.etat}</p>
          </div>

          {!modeEdition ? (
            <>
              <p className="text-indigo-700 whitespace-pre-line">
                {humeurDuJour.noteJournal || 'Pas de note.'}
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setModeEdition(true)}
                  className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <Edit2 size={18} /> Modifier
                </button>
                <button
                  onClick={handleSupprimer}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <Trash2 size={18} /> Supprimer
                </button>
              </div>
            </>
          ) : (
            <>
              <textarea
                rows="5"
                className="w-full p-3 border border-indigo-300 rounded-xl"
                value={editionNotes}
                onChange={(e) => setEditionNotes(e.target.value)}
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleModifier}
                  className="bg-indigo-700 text-white px-4 py-2 rounded-full font-bold"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setModeEdition(false)}
                  className="bg-gray-300 text-indigo-700 px-4 py-2 rounded-full font-bold"
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          onClick={() => setAfficherHistorique(!afficherHistorique)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
        >
          {afficherHistorique ? 'Masquer mon historique' : 'Voir mon historique'}
        </button>
      </div>

      {afficherHistorique && (
        <section className="mt-6 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100 pr-2">
          <h3 className="text-2xl font-semibold text-indigo-800 mb-4">Historique des humeurs</h3>
          <ul className="divide-y divide-indigo-200">
            {humeurs.map((h) => {
              const moodData = moodsList.find(m => m.label === h.etat) || {};
              const MoodIcon = moodData.Icon || Smile;
              const color = moodData.color || 'text-gray-600';

              return (
                <li
                  key={h.id}
                  className="flex items-start gap-4 py-4 hover:bg-indigo-50 transition-colors rounded-md cursor-default"
                >
                  <div className={`flex-shrink-0 rounded-full p-2 bg-indigo-100 ${color}`}>
                    <MoodIcon size={24} />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-indigo-700 text-lg">{h.etat}</span>
                      <span className="text-sm text-indigo-500 font-mono bg-indigo-200 rounded px-2 py-0.5">
                        {new Date(h.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-indigo-600 italic text-sm whitespace-pre-line">
                      {h.noteJournal || 'Aucune note.'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

export default SuiviHumeur;
