import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PremiumSuccess() {

  const navigate = useNavigate();

  useEffect(() => {

    localStorage.setItem(
      "role",
      "PREMIUM"
    );

    setTimeout(() => {
      navigate("/tableauUtilisateur");
    }, 3000);

  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center">

      <div className="bg-white p-8 rounded-xl shadow-xl text-center">

        <h1 className="text-3xl font-bold text-green-600">
          Paiement réussi 🎉
        </h1>

        <p className="mt-4">
          Votre compte Premium a été activé.
        </p>

      </div>

    </div>
  );
}