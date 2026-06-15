// src/pages/DevenirPremium.jsx

import React, { useState } from "react";
import Layout from "../components/commun/Layout";
import api from "../services/api";
import { Smile, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const DevenirPremium = () => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedPlan, setSelectedPlan] =
    useState("monthly");

  const plans = {
    monthly: {
      label: "Mensuel",
      price: 3,
      duration: "mois",
      description:
        "Accès flexible, annulez à tout moment."
    },

    quarterly: {
      label: "Trimestriel",
      price: 10,
      duration: "3 mois",
      description:
        "Économisez 15% par rapport au plan mensuel."
    },

    annually: {
      label: "Annuel",
      price: 30,
      duration: "an",
      description:
        "La meilleure offre : économisez 25%."
    }
  };

  const currentPlan =
    plans[selectedPlan];

  const handleStripeCheckout = async () => {

    try {

      setLoading(true);
      setError(null);

       
      const response =
  await api.post("/payments/premium-checkout", {
  plan: selectedPlan
});

      if (
        response.data &&
        response.data.url
      ) {

        window.location.href =
          response.data.url;

      } else {

        setError(
          "URL Stripe introuvable."
        );
      }

    } catch (error) {

      console.error(error);

      setError(
        error?.response?.data?.error ||
        "Impossible de démarrer le paiement."
      );

    } finally {

      setLoading(false);
    }
  };
console.log(api.defaults.baseURL);
  return (
    <Layout>

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center px-4 py-10">

        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.7
          }}
          className="mb-6 flex items-center gap-3"
        >

          <Smile
            className="w-10 h-10 text-indigo-600 animate-bounce"
          />

          <h1 className="text-3xl md:text-4xl font-bold text-indigo-700">
            Devenez Membre Premium
          </h1>

        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.4,
            duration: 0.7
          }}
          className="text-center text-gray-700 max-w-2xl mb-8 text-sm md:text-base"
        >
          Débloquez l'accès illimité à
          toutes nos ressources exclusives :
          exercices avancés, vidéos guidées,
          podcasts experts et contenus Premium.
        </motion.p>

        <motion.section
          initial={{
            scale: 0.95,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          transition={{
            delay: 0.6,
            duration: 0.7
          }}
          className="bg-white rounded-3xl shadow-2xl border border-indigo-200 p-8 max-w-3xl w-full"
        >

          <h2 className="flex items-center justify-center gap-2 text-xl font-semibold text-indigo-700 mb-6">

            <CreditCard
              className="w-6 h-6"
            />

            Choisissez votre formule

          </h2>

          <div className="flex flex-wrap justify-center gap-3 mb-8">

            {Object.keys(plans).map(
              (planKey) => (

                <button
                  key={planKey}
                  onClick={() =>
                    setSelectedPlan(planKey)
                  }
                  className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 ${
                    selectedPlan === planKey
                      ? "bg-indigo-700 text-white scale-105 shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plans[planKey].label}
                </button>
              )
            )}

          </div>

          <div className="text-center mb-8">

            <p className="text-5xl font-extrabold text-gray-900">

              {currentPlan.price.toFixed(2)} €

            </p>

            <p className="text-lg text-gray-500 mt-2">

              / {currentPlan.duration}

            </p>

            <p className="mt-4 text-gray-600">

              {currentPlan.description}

            </p>

          </div>

          {error && (

            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">

              {error}

            </div>

          )}

          <div className="flex justify-center">

            <button
              onClick={handleStripeCheckout}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all"
            >

              {loading
                ? "Redirection vers Stripe..."
                : `Payer ${currentPlan.price} €`}

            </button>

          </div>

          <div className="mt-8 text-center text-sm text-gray-500">

            Paiement sécurisé via Stripe 🔒

          </div>

        </motion.section>

      </main>

    </Layout>
  );
};

export default DevenirPremium;