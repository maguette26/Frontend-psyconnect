// src/components/psy/ListeReservations.jsx
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getReservations, updateReservationStatus } from "../../services/servicePsy";

/* ================= STATUTS BACKEND ================= */

const STATUTS = [
  "TOUS",
  "EN_ATTENTE",
  "EN_ATTENTE_PAIEMENT",
  "PAYEE",
  "REFUSE",
  "ANNULEE",
];

const STATUS_UI = {
  EN_ATTENTE: { label: "En attente", color: "#f59e0b", bg: "#fff7ed" },
  EN_ATTENTE_PAIEMENT: { label: "Paiement requis", color: "#3b82f6", bg: "#eff6ff" },
  PAYEE: { label: "Payée", color: "#22c55e", bg: "#ecfdf5" },
  REFUSE: { label: "Refusée", color: "#ef4444", bg: "#fef2f2" },
  ANNULEE: { label: "Annulée", color: "#6b7280", bg: "#f8fafc" },
};

/* ================= HELPERS ================= */

const formatDate = (d) =>
  new Date(d).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

const formatTime = (t) => (t ? t.replace(":", "h") : "—");

/* ================= TOAST ================= */

const Toast = ({ toast, onClose }) => (
  <motion.div
    initial={{ y: 30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 30, opacity: 0 }}
    style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      background: "#0f172a",
      color: "#fff",
      padding: "12px 16px",
      borderRadius: 12,
      fontSize: 13,
      zIndex: 9999,
      display: "flex",
      gap: 10,
      alignItems: "center",
      boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    }}
  >
    {toast.message}
    <button onClick={onClose} style={{ background: "transparent", border: 0, color: "#fff" }}>
      ✕
    </button>
  </motion.div>
);

/* ================= CARD ================= */

function Card({ r, onOpen, onAction, loading }) {
  const status = STATUS_UI[r.statut] || {
    label: r.statut,
    color: "#64748b",
    bg: "#f1f5f9",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card"
    >
      {/* LEFT */}
      <div className="left">
        <div className="avatar">
          {r.utilisateur?.prenom?.[0]}
          {r.utilisateur?.nom?.[0]}
        </div>

        <div className="info">
          <div className="name">
            {r.utilisateur?.prenom} {r.utilisateur?.nom}
          </div>

          <div className="meta">
            📅 {formatDate(r.dateReservation)}
            <span>•</span>
            ⏰ {formatTime(r.heureReservation)}
            <span>•</span>
            🧠 {formatTime(r.heureConsultation)}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="right">

        <span
          className="badge"
          style={{
            background: status.bg,
            color: status.color,
          }}
        >
          ● {status.label}
        </span>

        <button className="btn" onClick={() => onOpen(r)}>
          Détails
        </button>

        {r.statut === "EN_ATTENTE" && (
          <>
            <button
              className="btn success"
              disabled={loading === r.id}
              onClick={() => onAction(r.id, "PAYEE")}
            >
              Valider
            </button>

            <button
              className="btn danger"
              disabled={loading === r.id}
              onClick={() => onAction(r.id, "REFUSE")}
            >
              Refuser
            </button>
          </>
        )}

        {r.statut === "EN_ATTENTE_PAIEMENT" && (
          <button className="btn primary">
            💳 Paiement
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ================= MAIN ================= */

export default function ListeReservations({ proId }) {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("TOUS");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await getReservations(proId);
      setData(res);
    } catch {
      setToast({ message: "Erreur chargement données" });
    }
  }, [proId]);

  useEffect(() => {
    if (proId) load();
  }, [proId]);

  const filtered =
    filter === "TOUS"
      ? data
      : data.filter((r) => r.statut === filter);

  const action = async (id, statut) => {
    setLoading(id);
    try {
      await updateReservationStatus(id, statut);
      await load();
      setToast({
        message:
          statut === "PAYEE"
            ? "Réservation validée"
            : "Réservation refusée",
      });
    } catch {
      setToast({ message: "Erreur serveur" });
    }
    setLoading(null);
  };

  return (
    <div className="page">

      {/* HEADER */}
      <div className="header">
        <h1>📅 Réservations</h1>
        <p>Gestion des consultations</p>
      </div>

      {/* FILTERS */}
      <div className="filters">
        {STATUTS.map((s) => (
          <button
            key={s}
            className={filter === s ? "active" : ""}
            onClick={() => setFilter(s)}
          >
            {s === "TOUS" ? "Tous" : STATUS_UI[s]?.label || s}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="list">

        {filtered.length === 0 && (
          <div className="empty">
            Aucune réservation dans cette catégorie
          </div>
        )}

        <AnimatePresence>
          {filtered.map((r) => (
            <Card
              key={r.id}
              r={r}
              onOpen={setSelected}
              onAction={action}
              loading={loading}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="modalBg"
            onClick={() => setSelected(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2>Détails</h2>

              <p>👤 {selected.utilisateur?.prenom} {selected.utilisateur?.nom}</p>
              <p>📅 {formatDate(selected.dateReservation)}</p>
              <p>⏰ Réservation : {formatTime(selected.heureReservation)}</p>
              <p>🧠 Consultation : {formatTime(selected.heureConsultation)}</p>

              <button onClick={() => setSelected(null)}>Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* STYLE PREMIUM */}
      <style>{`
        .page{
          max-width: 1100px;
          margin:auto;
          padding:30px;
          font-family: Inter;
          background:#f8fafc;
          min-height:100vh;
        }

        .header h1{margin:0;font-size:28px}
        .header p{color:#64748b;margin-bottom:20px}

        .filters{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-bottom:20px;
        }

        .filters button{
          padding:8px 14px;
          border-radius:999px;
          border:1px solid #e2e8f0;
          background:white;
          cursor:pointer;
        }

        .filters .active{
          background:#0f172a;
          color:white;
        }

        .list{
          display:flex;
          flex-direction:column;
          gap:12px;
        }

        .card{
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:16px;
          background:white;
          border-radius:16px;
          border:1px solid #e2e8f0;
          transition:.2s;
        }

        .card:hover{
          transform:translateY(-2px);
          box-shadow:0 10px 30px rgba(0,0,0,0.06);
        }

        .left{display:flex;gap:12px;align-items:center}

        .avatar{
          width:44px;height:44px;
          border-radius:50%;
          background:#e2e8f0;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:600;
        }

        .name{font-weight:600}
        .meta{font-size:12px;color:#64748b;display:flex;gap:6px;flex-wrap:wrap}

        .right{display:flex;gap:8px;align-items:center}

        .badge{
          font-size:12px;
          padding:4px 10px;
          border-radius:999px;
          font-weight:600;
        }

        .btn{
          padding:6px 10px;
          border-radius:10px;
          border:1px solid #e2e8f0;
          background:white;
          cursor:pointer;
        }

        .success{background:#dcfce7}
        .danger{background:#fee2e2}
        .primary{background:#dbeafe}

        .empty{
          padding:40px;
          text-align:center;
          color:#64748b;
          background:white;
          border-radius:12px;
        }

        .modalBg{
          position:fixed;
          inset:0;
          background:rgba(0,0,0,0.4);
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .modal{
          background:white;
          padding:20px;
          border-radius:12px;
          width:360px;
        }
      `}</style>
    </div>
  );
}