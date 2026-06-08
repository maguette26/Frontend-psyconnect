import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConsultations } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const stompClient = useWebSocket({
    consultationId: null,
  });

  useEffect(() => {
    getConsultations()
      .then(setConsultations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // auto open chat
  useEffect(() => {
    if (!stompClient) return;
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="consultations-page">
      <h1>Mes Consultations</h1>

      <div className="consultations-list">
        {consultations.map((c) => {
          const canChat = c.statut === "CONFIRMEE";

          return (
            <div key={c.idConsultation} className="consultation-card">
              <p>
                Dr {c.professionnel?.nom} {c.professionnel?.prenom}
              </p>

              <p>{c.prix} MAD</p>
console.log("CONSULTATION OBJ:", c);
              {/* ✅ BOUTON AJOUTÉ (SANS TOUCHER DESIGN) */}
              {canChat && (
                <button
                  onClick={() =>
                    
                    navigate(`/chat/${c.idConsultation}`)
                  }
                  style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    background: "#3b82f6",
                    color: "white",
                    borderRadius: 6,
                  }}
                >
                  💬 Ouvrir chat
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}