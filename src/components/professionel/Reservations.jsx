// src/components/psy/ListeReservations.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getReservations, updateReservationStatus } from "../../services/servicePsy";
import { motion } from "framer-motion";

/* ================= STATUT BACKEND ================= */
const STATUTS = [
  "TOUS",
  "EN_ATTENTE",
  "EN_ATTENTE_PAIEMENT",
  "PAYEE",
  "REFUSE",
  "ANNULEE",
];

const LABELS = {
  EN_ATTENTE: "En attente",
  EN_ATTENTE_PAIEMENT: "Paiement",
  PAYEE: "Payée",
  REFUSE: "Refusée",
  ANNULEE: "Annulée",
};

/* ================= HELPERS ================= */
const fmtDate = (d) =>
  d
    ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
    : "—";

const fmtHeure = (h) => (h ? h.replace(":", "h") : "—");

const isEmpty = (list) => !list || list.length === 0;

/* ================= ICONS ================= */
const Calendar = () => <span>📅</span>;
const Clock = () => <span>⏰</span>;
const User = () => <span>👤</span>;
const Eye = () => <span>👁</span>;
const Check = () => <span>✔</span>;
const X = () => <span>✖</span>;

/* ================= TOAST ================= */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background:
          type === "error" ? "#fee2e2" : type === "success" ? "#dcfce7" : "#dbeafe",
        padding: "12px 16px",
        borderRadius: 12,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        fontSize: 13,
        zIndex: 9999,
      }}
    >
      {msg}
    </div>
  );
}

/* ================= MAIN ================= */
export default function ListeReservations({ proId }) {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("TOUS");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const res = await getReservations(proId);
    setData(res);
  }, [proId]);

  useEffect(() => {
    if (proId) load();
  }, [proId, load]);

  const updateStatus = async (id, statut) => {
    try {
      await updateReservationStatus(id, statut);
      setToast({ msg: "Statut mis à jour", type: "success" });
      load();
    } catch {
      setToast({ msg: "Erreur serveur", type: "error" });
    }
  };

  const filtered =
    filter === "TOUS" ? data : data.filter((r) => r.statut === filter);

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h2>📋 Réservations</h2>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 15 }}>
        {STATUTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: "1px solid #ddd",
              background: filter === s ? "#111827" : "#fff",
              color: filter === s ? "#fff" : "#111",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {s === "TOUS" ? "Tous" : LABELS[s] || s}
          </button>
        ))}
      </div>

      {/* EMPTY STATE */}
      {isEmpty(filtered) && (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
          Aucune réservation pour ce filtre
        </div>
      )}

      {/* LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* LEFT */}
            <div>
              <div style={{ fontWeight: "bold" }}>
                <User /> {r.utilisateur?.prenom} {r.utilisateur?.nom}
              </div>

              <div style={{ fontSize: 12, color: "#666", marginTop: 5 }}>
                <Calendar /> {fmtDate(r.dateReservation)} •{" "}
                <Clock /> {fmtHeure(r.heureReservation)} →{" "}
                {fmtHeure(r.heureConsultation)}
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setSelected(r)}>
                <Eye /> Détails
              </button>

              {r.statut === "EN_ATTENTE" && (
                <>
                  <button onClick={() => updateStatus(r.id, "PAYEE")}>
                    <Check /> Valider
                  </button>
                  <button onClick={() => updateStatus(r.id, "REFUSE")}>
                    <X /> Refuser
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL SIMPLE */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 12,
              width: 400,
            }}
          >
            <h3>Détails réservation</h3>

            <p>👤 {selected.utilisateur?.prenom}</p>
            <p>📅 {fmtDate(selected.dateReservation)}</p>
            <p>⏰ {fmtHeure(selected.heureReservation)}</p>
            <p>💬 Consultation: {fmtHeure(selected.heureConsultation)}</p>
            <p>📌 Statut: {selected.statut}</p>

            <button onClick={() => setSelected(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}