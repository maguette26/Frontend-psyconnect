// pages/ConsultationsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConsultations } from "../services/api";
 

const STATUT_LABELS = {
  EN_ATTENTE:    { label: "En attente", color: "#f59e0b" },
  CONFIRMEE:     { label: "Confirmée ✓", color: "#10b981" },  // ← chat accessible
  TERMINEE:      { label: "Terminée", color: "#6b7280" },
};

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

 useEffect(() => {
  getConsultations()
    .then(setConsultations)
    .catch((e) => setError(e.message))
    .finally(() => setLoading(false));
}, []);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="consultations-page">
      <h1>Mes Consultations</h1>
      <div className="consultations-list">
        {consultations.length === 0 && (
          <p className="empty">Aucune consultation trouvée.</p>
        )}
        {consultations.map((c) => {
          const statut = STATUT_LABELS[c.statut] ?? { label: c.statut, color: "#999" };
          const canChat = c.statut === "CONFIRMEE";
          return (
            <div key={c.idConsultation} className="consultation-card">
              <div className="card-header">
                <span
                  className="statut-badge"
                  style={{ backgroundColor: statut.color }}
                >
                  {statut.label}
                </span>
                <span className="date">
                  {new Date(c.dateConsultation).toLocaleDateString("fr-FR")}
                  {" · "}
                  {c.heure}
                </span>
              </div>
              <div className="card-body">
                <p className="professionnel">
                  Dr. {c.professionnel?.nom} {c.professionnel?.prenom}
                </p>
                <p className="prix">{c.prix} MAD · {c.dureeMinutes} min</p>
              </div>
              {canChat && (
                <button
                  className="btn-chat"
                  onClick={() => navigate(`/chat/${c.idConsultation}`)}
                >
                  💬 Ouvrir le chat
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}