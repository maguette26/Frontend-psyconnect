import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  CalendarCheck, Clock, Euro, MessageSquare,
  SlidersHorizontal, Info, Stethoscope, XCircle, FileText
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

const formatHeure = (heureStr) => {
  if (!heureStr) return '—';
  return heureStr.substring(0, 5);
};

const statutConfig = {
  EN_ATTENTE: { label: '🕒 En attente',  color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMEE:  { label: '🔵 Confirmée',   color: 'bg-blue-100 text-blue-800'    },
  TERMINEE:   { label: '✅ Terminée',    color: 'bg-green-100 text-green-800'  },
  ANNULEE:    { label: '❌ Annulée',     color: 'bg-red-100 text-red-800'      },
};

const StatutBadge = ({ statut }) => {
  const config = statutConfig[statut] || { label: statut, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="flex items-center gap-2 text-gray-500">{icon} {label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

const MesConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [statut, setStatut]               = useState('');
  const [error, setError]                 = useState(null);
  const [selected, setSelected]           = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response = await api.get('/consultations/mes-consultations');
        setConsultations(response.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchConsultations();
  }, []);

  const filteredConsultations = consultations.filter(c =>
    statut ? c.statut === statut : true
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <motion.h2
          className="text-4xl font-extrabold text-indigo-700 flex items-center gap-3"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <MessageSquare size={32} /> Mes Consultations
        </motion.h2>

        <div className="flex gap-3 items-center">
          <SlidersHorizontal className="text-gray-500" />
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="border border-indigo-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">🕒 En attente</option>
            <option value="CONFIRMEE">🔵 Confirmée</option>
            <option value="TERMINEE">✅ Terminée</option>
            <option value="ANNULEE">❌ Annulée</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 text-center mb-6">{error}</p>}

      {filteredConsultations.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-16">Aucune consultation trouvée.</p>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {filteredConsultations.map((c) => (
              <motion.li
                key={c.idConsultation}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                onClick={() => setSelected(c)}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">
                        Dr {c.professionnelPrenom} {c.professionnelNom}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(c.dateConsultation)} · {formatHeure(c.heure)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:ml-auto">
                    <StatutBadge statut={c.statut} />
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Euro size={14} />{c.prix?.toFixed(2) || '—'} €
                    </span>
                    <span className="text-xs text-indigo-500 font-medium underline">Voir détails →</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Modal détail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              >
                <XCircle size={24} />
              </button>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                  <Stethoscope size={30} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Dr {selected.professionnelPrenom} {selected.professionnelNom}
                </h3>
                <StatutBadge statut={selected.statut} />
              </div>

              {/* Infos */}
              <div className="space-y-1">
                <InfoRow icon={<CalendarCheck size={16} />} label="Date"     value={formatDate(selected.dateConsultation)} />
                <InfoRow icon={<Clock size={16} />}         label="Heure"    value={formatHeure(selected.heure)} />
                <InfoRow icon={<Info size={16} />}          label="Durée"    value={`${selected.dureeMinutes || 45} min`} />
                <InfoRow icon={<Euro size={16} />}          label="Prix"     value={`${selected.prix?.toFixed(2) || '—'} €`} />
              </div>

              {/* Notes si terminée */}
              {selected.statut === 'TERMINEE' && (selected.notesUtilisateur || selected.notesProfessionnel) && (
                <div className="mt-5 space-y-3">
                  {selected.notesUtilisateur && (
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-indigo-600 mb-1 flex items-center gap-1">
                        <FileText size={13} /> Votre note
                      </p>
                      <p className="text-sm text-gray-700 italic">{selected.notesUtilisateur}</p>
                    </div>
                  )}
                  {selected.notesProfessionnel && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-green-600 mb-1 flex items-center gap-1">
                        <FileText size={13} /> Note du professionnel
                      </p>
                      <p className="text-sm text-gray-700 italic">{selected.notesProfessionnel}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => setSelected(null)}
                  className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MesConsultations;