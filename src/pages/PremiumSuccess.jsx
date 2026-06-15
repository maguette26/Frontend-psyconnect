import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
const PremiumSuccess = () => {
  const navigate = useNavigate();

 useEffect(() => {

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");

      localStorage.setItem(
        "currentUserInfo",
        JSON.stringify(res.data)
      );

      // 🔥 AJOUT IMPORTANT
      localStorage.setItem("role", res.data.role);

    } catch (e) {}
  };

  refreshUser();

  setTimeout(() => {
    window.location.href = "/tableauUtilisateur";
  }, 2000);

}, []);

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