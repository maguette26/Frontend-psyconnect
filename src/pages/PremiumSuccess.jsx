import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const PremiumSuccess = () => {
  const navigate = useNavigate();
  // Évite un double-appel en StrictMode / re-render
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    let isMounted = true;

    const refreshUser = async () => {
      try {
        // 1. Récupérer un nouveau token JWT contenant le rôle à jour (PREMIUM).
        //    Nécessaire si un autre endroit du code décode le JWT directement
        //    plutôt que d'appeler /auth/me.
        try {
          const tokenRes = await api.post("/auth/refresh-token");
          if (tokenRes.data?.token) {
            localStorage.setItem("token", tokenRes.data.token);
          }
        } catch (tokenErr) {
          // Non bloquant : si l'endpoint refresh-token n'existe pas encore
          // côté backend, on continue avec /auth/me quand même.
          console.warn("refresh-token indisponible :", tokenErr);
        }

        // 2. Relire les infos utilisateur à jour (rôle, id, etc.)
        const res = await api.get("/auth/me");
        console.log("User après paiement:", res.data);

        if (!isMounted) return;

        localStorage.setItem("currentUserInfo", JSON.stringify(res.data));
        localStorage.setItem("role", res.data.role);

        // 3. Prévenir tous les composants (dont Header) que le rôle a changé
        window.dispatchEvent(new Event("roleChange"));
        window.dispatchEvent(new Event("user-updated"));

        setTimeout(() => {
          if (isMounted) navigate("/ressources", { replace: true });
        }, 300);
      } catch (err) {
        console.error("Erreur lors du rafraîchissement du profil :", err);
        if (isMounted) {
          // En cas d'échec, on redirige quand même pour ne pas bloquer
          // l'utilisateur sur cette page ; le rôle se rafraîchira au
          // prochain /auth/me appelé ailleurs dans l'app.
          setTimeout(() => {
            if (isMounted) navigate("/ressources", { replace: true });
          }, 1000);
        }
      }
    };

    refreshUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-green-600">
        Paiement réussi 🎉
      </h1>
      <p>Activation de votre compte Premium....</p>
    </div>
  );
};

export default PremiumSuccess;