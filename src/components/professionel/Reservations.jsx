import React, { useEffect, useState } from "react";
import { getReservations, updateReservationStatus } from "../../services/servicePsy";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Mail,
  Eye,
  Video
} from "lucide-react";

const STATUTS = ["TOUS", "EN_ATTENTE", "VALIDE", "REFUSE"];

const COLORS = {
  EN_ATTENTE: "bg-yellow-100 text-yellow-700",
  VALIDE: "bg-green-100 text-green-700",
  REFUSE: "bg-red-100 text-red-700",
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatHeure = (h) => {
  if (!h) return "—";
  return h.toString().replace("H", ":").substring(0, 5);
};

const getHeure = (res) => {
  return (
    res.heureDebut ||
    res.heureReservation ||
    res.consultation?.heure ||
    "—"
  );
};

export default function ListeReservations({ proId }) {
  const [data, setData] = useState([]);
  const [filtre, setFiltre] = useState("TOUS");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (proId) load();
  }, [proId]);

  const load = async () => {
    const res = await getReservations(proId);
    setData(res);
  };

  const changeStatus = async (id, statut) => {
    await updateReservationStatus(id, statut);
    load();
  };

  const filtered =
    filtre === "TOUS" ? data : data.filter((r) => r.statut === filtre);

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          Gestion des réservations
        </h1>

        <select
          className="border rounded px-3 py-1"
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
        >
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* LISTE */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Aucune réservation pour ce filtre
          </p>
        )}

        {filtered.map((res) => (
          <div
            key={res.id}
            onClick={() => setSelected(res)}
            className="bg-white border rounded-xl p-4 flex justify-between items-center hover:shadow cursor-pointer"
          >
            {/* USER */}
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                <User size={18} />
              </div>

              <div>
                <p className="font-semibold">
                  {res.utilisateur?.prenom || "—"} {res.utilisateur?.nom || ""}
                </p>

                <p className="text-xs text-gray-500 flex gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(res.dateReservation)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatHeure(getHeure(res))}
                  </span>
                </p>
              </div>
            </div>

            {/* STATUS */}
            <span className={`px-3 py-1 rounded-full text-xs ${COLORS[res.statut]}`}>
              {res.statut}
            </span>

            {/* ACTION */}
            <Eye className="text-gray-400" />
          </div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-md rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              {/* HEADER MODAL */}
              <div className="mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <User size={18} />
                  {selected.utilisateur?.prenom} {selected.utilisateur?.nom}
                </h2>

                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail size={14} />
                  {selected.utilisateur?.email || "—"}
                </p>
              </div>

              {/* INFOS */}
              <div className="space-y-3 text-sm">

                <p className="flex justify-between">
                  <span>Date :</span>
                  <b>{formatDate(selected.dateReservation)}</b>
                </p>

                <p className="flex justify-between">
                  <span>Heure réservation :</span>
                  <b>{formatHeure(getHeure(selected))}</b>
                </p>

                <p className="flex justify-between">
                  <span>Statut :</span>
                  <b>{selected.statut}</b>
                </p>

                {/* VISIO */}
                {selected.consultation?.lienVisio && (
                  <a
                    href={selected.consultation.lienVisio}
                    className="flex items-center gap-2 text-blue-600 mt-3"
                    target="_blank"
                  >
                    <Video size={14} />
                    Rejoindre la visio
                  </a>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex gap-2">
                {selected.statut === "EN_ATTENTE" && (
                  <>
                    <button
                      onClick={() => changeStatus(selected.id, "VALIDE")}
                      className="flex-1 bg-green-600 text-white py-2 rounded"
                    >
                      Valider
                    </button>

                    <button
                      onClick={() => changeStatus(selected.id, "REFUSE")}
                      className="flex-1 bg-red-600 text-white py-2 rounded"
                    >
                      Refuser
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full mt-3 bg-gray-100 py-2 rounded"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}