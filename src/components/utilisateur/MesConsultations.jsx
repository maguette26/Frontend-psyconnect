import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  CalendarCheck, Clock, Euro, MessageSquare,
  SlidersHorizontal, Info, Stethoscope, XCircle, FileText, Trash2
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

const formatHeure = (heureStr) => {
  if (!heureStr) return '—';
  return heureStr.replace('H', ':').substring(0, 5);
};

const isPassee = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr + 'T00:00:00') < new Date();
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
  const [statut, setStatut] = useState('');
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const navigate = useNavigate();

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

  const handleSupprimer = async (c) => {
    try {
      await api.delete(`/consultations/supprimer/${c.id}`);
      setConsultations((prev) => prev.filter(x => x.id !== c.id));
      setConfirmDelete(null);
      setSelected(null);
      toast.success('Consultation supprimée !');
    } catch {
      toast.error('Erreur lors de la suppression !');
    }
  };

  const filteredConsultations = consultations.filter(c =>
    statut ? c.statut === statut : true
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToastContainer position="top-right" />

      {/* HEADER */}
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

      {/* LISTE */}
      {filteredConsultations.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-16">
          Aucune consultation trouvée.
        </p>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {filteredConsultations.map((c) => (
              <motion.li
                key={c.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 gap-4">

                  {/* INFO */}
                  <div
                    className="flex items-center gap-4 cursor-pointer flex-1"
                    onClick={() => setSelected(c)}
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Stethoscope size={22} />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 text-base">
                        Dr {c.professionnelPrenom} {c.professionnelNom}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(c.date)} · {formatHeure(c.heure)}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap items-center gap-3 md:ml-auto">
                    <StatutBadge statut={c.statut} />

                    {/* 💬 CHAT BUTTON */}
                    {c.statut === 'CONFIRMEE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/${c.id}`);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium transition"
                      >
                        <MessageSquare size={14} />
                        Chat
                      </button>
                    )}

                    <span
                      className="text-xs text-indigo-500 font-medium underline cursor-pointer"
                      onClick={() => setSelected(c)}
                    >
                      Voir détails →
                    </span>

                    {(isPassee(c.date) || c.statut === 'ANNULEE' || c.statut === 'TERMINEE') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(c); }}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* MODAL DETAIL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-md p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Détails consultation</h3>

              <InfoRow icon={<CalendarCheck />} label="Date" value={formatDate(selected.date)} />
              <InfoRow icon={<Clock />} label="Heure" value={formatHeure(selected.heure)} />
              <InfoRow icon={<Euro />} label="Prix" value={`${selected.prix} €`} />

              {/* 💬 CHAT BUTTON MODAL */}
              {selected.statut === 'CONFIRMEE' && (
                <button
                  onClick={() => navigate(`/chat/${selected.id}`)}
                  className="w-full mt-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  Ouvrir le chat 💬
                </button>
              )}

              <button
                onClick={() => setSelected(null)}
                className="w-full mt-3 py-2 bg-gray-100 rounded-xl"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MesConsultations;