// src/components/psy/ListeReservations.jsx
import React, { useEffect, useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getReservations, updateReservationStatus } from "../../services/servicePsy";

/* ===================== CONFIG ===================== */

const STATUTS = ["TOUS", "EN_ATTENTE", "VALIDE", "REFUSE"];

const LABELS = {
  EN_ATTENTE: "En attente",
  VALIDE: "Validé",
  REFUSE: "Refusé",
};

const ICONS = {
  EN_ATTENTE: "⏳",
  VALIDE: "✅",
  REFUSE: "❌",
  TOUS: "📋",
};

const COLORS = {
  EN_ATTENTE: "#F59E0B",
  VALIDE: "#22C55E",
  REFUSE: "#EF4444",
};

/* ===================== HELPERS ===================== */

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "—";

const fmtTime = (t) => (t ? t.replace(":", "h") : "—");

const isPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
};

/* ===================== TOAST ===================== */

function Toast({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, toast.duration || 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const style = {
    success: "#16a34a",
    error: "#dc2626",
    info: "#2563eb",
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: style[toast.type] || "#2563eb",
        color: "white",
        padding: "12px 16px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        zIndex: 9999,
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}
    >
      {toast.message}
      <button onClick={onClose} style={{ background: "transparent", border: 0, color: "white" }}>
        ✕
      </button>
    </motion.div>
  );
}

/* ===================== CARD ===================== */

const ReservationCard = memo(({ r, onOpen, onAction, loading }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card"
    >
      <div className="left">
        <div className="avatar">{r.utilisateur?.prenom?.[0]}{r.utilisateur?.nom?.[0]}</div>

        <div>
          <div className="name">
            {r.utilisateur?.prenom} {r.utilisateur?.nom}
          </div>

          <div className="details">
            📅 {fmtDate(r.dateReservation)} • ⏰ {fmtTime(r.heureReservation)} • 🧠 {fmtTime(r.heureConsultation)}
          </div>

          {isPast(r.dateReservation) && (
            <div className="badgePast">passée</div>
          )}
        </div>
      </div>

      <div className="right">
        <div className="status" style={{ color: COLORS[r.statut] }}>
          {ICONS[r.statut]} {LABELS[r.statut]}
        </div>

        <button className="btn" onClick={() => onOpen(r)}>
          👁 Détails
        </button>

        {r.statut === "EN_ATTENTE" && (
          <>
            <button
              disabled={loading === r.id}
              onClick={() => onAction(r.id, "VALIDE")}
              className="btn success"
            >
              {loading === r.id ? "..." : "✔"}
            </button>

            <button
              disabled={loading === r.id}
              onClick={() => onAction(r.id, "REFUSE")}
              className="btn danger"
            >
              ✖
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
});

/* ===================== MAIN ===================== */

const ListeReservations = ({ proId }) => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("TOUS");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await getReservations(proId);
      setData(res);
    } catch {
      setToast({ type: "error", message: "Erreur chargement réservations" });
    }
  }, [proId]);

  useEffect(() => {
    if (proId) load();
  }, [proId]);

  const filtered =
    filter === "TOUS"
      ? data
      : data.filter((r) => r.statut === filter);

  const handleAction = async (id, statut) => {
    setLoading(id);
    try {
      await updateReservationStatus(id, statut);
      setToast({
        type: "success",
        message: statut === "VALIDE" ? "Réservation validée" : "Réservation refusée",
      });
      await load();
    } catch {
      setToast({ type: "error", message: "Erreur mise à jour" });
    }
    setLoading(null);
  };

  return (
    <div className="container">

      {/* HEADER */}
      <h1>📅 Réservations</h1>
      <p className="sub">Gestion des consultations</p>

      {/* FILTERS */}
      <div className="filters">
        {STATUTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={filter === s ? "active" : ""}
          >
            {ICONS[s]} {s === "TOUS" ? "Tous" : LABELS[s]}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="list">
        {filtered.length === 0 && (
          <div className="empty">
            🚫 Aucune réservation trouvée pour ce filtre
          </div>
        )}

        <AnimatePresence>
          {filtered.map((r) => (
            <ReservationCard
              key={r.id}
              r={r}
              loading={loading}
              onOpen={setSelected}
              onAction={handleAction}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2>📄 Détails</h2>

              <p>👤 {selected.utilisateur?.prenom} {selected.utilisateur?.nom}</p>
              <p>📅 {fmtDate(selected.dateReservation)}</p>
              <p>⏰ Réservation : {fmtTime(selected.heureReservation)}</p>
              <p>🧠 Consultation : {fmtTime(selected.heureConsultation)}</p>

              <button onClick={() => setSelected(null)}>Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <Toast toast={toast} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      {/* STYLE */}
      <style>{`
        .container{max-width:900px;margin:auto;padding:20px;font-family:Inter}
        h1{margin-bottom:4px}
        .sub{color:#64748b;margin-bottom:20px}

        .filters{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}
        .filters button{
          padding:6px 12px;border-radius:20px;border:1px solid #e2e8f0;background:#fff;cursor:pointer
        }
        .filters .active{background:#1e3a8a;color:#fff}

        .list{display:flex;flex-direction:column;gap:10px}

        .card{
          display:flex;justify-content:space-between;align-items:center;
          padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:#fff
        }

        .left{display:flex;gap:12px;align-items:center}
        .avatar{width:40px;height:40px;border-radius:50%;background:#e2e8f0;
          display:flex;align-items:center;justify-content:center;font-weight:bold}

        .name{font-weight:600}
        .details{font-size:12px;color:#64748b}
        .badgePast{font-size:11px;color:#dc2626}

        .right{display:flex;gap:8px;align-items:center}

        .btn{padding:6px 10px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;cursor:pointer}
        .success{background:#dcfce7}
        .danger{background:#fee2e2}

        .empty{padding:30px;text-align:center;color:#64748b}

        .modalBg{
          position:fixed;inset:0;background:rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center
        }
        .modal{
          background:#fff;padding:20px;border-radius:12px;width:320px
        }
      `}</style>
    </div>
  );
};

export default ListeReservations;