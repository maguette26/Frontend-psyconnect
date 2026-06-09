// pages/ConsultationAccessPage.jsx
// Route : /access/consultation/:id

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

const STATUTS = {
  EN_ATTENTE: "EN_ATTENTE",
  CONFIRMEE: "CONFIRMEE",
  EN_COURS: "EN_COURS",
  TERMINEE: "TERMINEE",
  ANNULEE: "ANNULEE",
};

export default function ConsultationAccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState("loading"); // loading | unauthorized | en_attente | confirmee | en_cours | terminee | annulee | error
  const [consultation, setConsultation] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Récupère la consultation + vérifie l'autorisation côté backend
        const res = await apiClient.get(`/api/consultations/${id}/access`);
        const data = res.data;
        setConsultation(data);

        switch (data.statut) {
          case STATUTS.EN_ATTENTE:
            setState("en_attente");
            break;
          case STATUTS.CONFIRMEE:
            setState("confirmee");
            break;
          case STATUTS.EN_COURS:
            // Redirection directe vers le chat
            navigate(`/chat/${id}`, { replace: true });
            break;
          case STATUTS.TERMINEE:
            setState("terminee");
            break;
          case STATUTS.ANNULEE:
            setState("annulee");
            break;
          default:
            setState("error");
        }
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          setState("unauthorized");
        } else {
          setState("error");
        }
      }
    };

    load();
  }, [id, navigate]);

  return <div style={styles.page}>{renderContent(state, consultation, navigate)}</div>;
}

function renderContent(state, consultation, navigate) {
  switch (state) {
    case "loading":
      return <LoadingCard />;

    case "unauthorized":
      return (
        <StatusCard
          emoji="🔒"
          color="#dc3545"
          title="Accès refusé"
          message="Vous n'êtes pas autorisé à accéder à cette consultation."
        />
      );

    case "en_attente":
      return (
        <StatusCard
          emoji="⏳"
          color="#f0a500"
          title="Consultation en attente"
          message="Cette consultation est en attente de confirmation. Revenez un peu plus tard."
          detail={consultation ? `Prévu le ${formatDate(consultation.dateConsultation)} à ${consultation.heure}` : null}
        />
      );

    case "confirmee":
      return (
        <StatusCard
          emoji="✅"
          color="#28a745"
          title="Consultation confirmée"
          message="Votre consultation est confirmée. Elle n'a pas encore commencé."
          detail={consultation ? `Prévu le ${formatDate(consultation.dateConsultation)} à ${consultation.heure}` : null}
        />
      );

    case "terminee":
      return <HistoriqueCard consultation={consultation} navigate={navigate} />;

    case "annulee":
      return (
        <StatusCard
          emoji="❌"
          color="#6c757d"
          title="Consultation annulée"
          message="Cette consultation a été annulée."
        />
      );

    case "error":
    default:
      return (
        <StatusCard
          emoji="⚠️"
          color="#dc3545"
          title="Une erreur s'est produite"
          message="Impossible de charger les informations. Veuillez réessayer."
          action={{ label: "Réessayer", onClick: () => window.location.reload() }}
        />
      );
  }
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function LoadingCard() {
  return (
    <div style={styles.card}>
      <div style={styles.spinner} />
      <p style={{ color: "#888", marginTop: 16 }}>Vérification en cours…</p>
    </div>
  );
}

function StatusCard({ emoji, color, title, message, detail, action }) {
  return (
    <div style={{ ...styles.card, borderTop: `5px solid ${color}` }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</div>
      <h2 style={{ color, margin: "0 0 10px" }}>{title}</h2>
      <p style={styles.message}>{message}</p>
      {detail && <p style={styles.detail}>{detail}</p>}
      {action && (
        <button style={{ ...styles.btn, background: color }} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

function HistoriqueCard({ consultation, navigate }) {
  if (!consultation) return <LoadingCard />;

  return (
    <div style={{ ...styles.card, borderTop: "5px solid #6c757d" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
      <h2 style={{ color: "#6c757d", margin: "0 0 8px" }}>Consultation terminée</h2>
      <p style={styles.detail}>
        {formatDate(consultation.dateConsultation)} à {consultation.heure}
      </p>

      <div style={styles.infoBlock}>
        <InfoRow label="Professionnel" value={`${consultation.professionnelPrenom} ${consultation.professionnelNom}`} />
        <InfoRow label="Patient" value={`${consultation.utilisateurPrenom} ${consultation.utilisateurNom}`} />
        <InfoRow label="Durée" value={`${consultation.dureeMinutes} min`} />
        <InfoRow label="Statut" value="Terminée" badge="#6c757d" />
      </div>

      <button style={{ ...styles.btn, background: "#667eea" }} onClick={() => navigate("/")}>
        Retour à l'accueil
      </button>
    </div>
  );
}

function InfoRow({ label, value, badge }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={badge ? { ...styles.infoValue, background: badge, color: "#fff", borderRadius: 4, padding: "2px 8px" } : styles.infoValue}>
        {value}
      </span>
    </div>
  );
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    fontFamily: "sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 32px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    maxWidth: 420,
    width: "100%",
  },
  message: { color: "#555", fontSize: 15, margin: "0 0 8px", lineHeight: 1.5 },
  detail: { color: "#888", fontSize: 13, margin: "0 0 20px" },
  btn: {
    display: "inline-block",
    marginTop: 20,
    padding: "11px 28px",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  infoBlock: {
    textAlign: "left",
    background: "#f8f9fa",
    borderRadius: 10,
    padding: "16px 20px",
    margin: "16px 0",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #eee",
  },
  infoLabel: { color: "#888", fontSize: 13 },
  infoValue: { color: "#2d2d4e", fontSize: 14, fontWeight: 600 },
  spinner: {
    width: 44,
    height: 44,
    border: "4px solid #e8e8f0",
    borderTopColor: "#667eea",
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
    margin: "0 auto",
  },
};