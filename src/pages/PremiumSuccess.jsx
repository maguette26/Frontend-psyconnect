import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const PremiumSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const refreshUser = async () => {
      try {
        const res = await api.get("/auth/me");

        localStorage.setItem("role", res.data.role);

        window.dispatchEvent(new Event("roleChange"));
        window.dispatchEvent(new Event("storage"));

        if (isMounted) {
          setTimeout(() => {
            navigate("/ressources", { replace: true });
          }, 300);
        }

      } catch (err) {
        console.error(err);
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
      <p>Activation de votre compte Premium...</p>
    </div>
  );
};

export default PremiumSuccess;