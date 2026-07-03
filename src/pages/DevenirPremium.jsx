// src/pages/DevenirPremium.jsx

import React, { useState } from "react";
import Layout from "../components/commun/Layout";
import api from "../services/api";
import {
  CreditCard,
  Crown,
  Check,
  Lock,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Infinity as InfinityIcon,
  Headphones,
  Dumbbell,
  FileText,
  Video,
  CalendarClock,
  Headset,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Contenu purement visuel — aucune donnée métier, aucun appel API.
const AVANTAGES = [
  { icon: InfinityIcon, label: "Ressources illimitées" },
  { icon: Headphones, label: "Podcasts exclusifs" },
  { icon: Dumbbell, label: "Exercices avancés" },
  { icon: FileText, label: "Guides PDF" },
  { icon: Video, label: "Vidéos Premium" },
  { icon: CalendarClock, label: "Nouveaux contenus chaque mois" },
  { icon: Headset, label: "Support prioritaire" },
];

const COMPARAISON = [
  { feature: "Ressources", free: true, premium: true },
  { feature: "Vidéos Premium", free: false, premium: true },
  { feature: "Podcasts", free: false, premium: true },
  { feature: "Guides PDF", free: "Limité", premium: true },
  { feature: "Support", free: "Standard", premium: "Prioritaire" },
];

const CONFIANCE = [
  "Paiement sécurisé",
  "Annulation à tout moment",
  "Accès immédiat",
  "Données protégées",
];

const FAQ_ITEMS = [
  {
    question: "Puis-je annuler ?",
    answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace membre, sans engagement.",
  },
  {
    question: "Quand le Premium est-il activé ?",
    answer: "Votre accès Premium est activé immédiatement après la confirmation de votre paiement.",
  },
  {
    question: "Le paiement est-il sécurisé ?",
    answer: "Oui, tous les paiements sont traités par Stripe. Aucune donnée bancaire n'est stockée sur nos serveurs.",
  },
  {
    question: "Puis-je changer de formule ?",
    answer: "Oui, vous pouvez changer de formule à tout moment depuis votre espace membre.",
  },
];

const DevenirPremium = () => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedPlan, setSelectedPlan] =
    useState("monthly");

  // État purement visuel pour l'accordéon FAQ — n'a aucun impact sur la logique métier.
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

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

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex flex-col items-center justify-center px-4 py-14">

        {/* Formes floues discrètes en arrière-plan */}
        <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute top-10 -right-20 w-80 h-80 rounded-full bg-amber-100/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-blue-100/40 blur-3xl" />

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
          className="relative mb-6 flex items-center gap-3"
        >

          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 shadow-md shadow-amber-200">
            <Crown className="w-6 h-6 text-white" />
          </span>

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
          className="relative text-center text-gray-700 max-w-2xl mb-10 text-sm md:text-base"
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
          className="relative bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-2xl shadow-indigo-100 border border-indigo-100 p-8 md:p-10 max-w-3xl w-full"
        >

          <h2 className="flex items-center justify-center gap-2 text-xl font-semibold text-indigo-700 mb-8">

            <CreditCard
              className="w-6 h-6"
            />

            Choisissez votre formule

          </h2>

          {/* Cartes de sélection des plans (remplace les boutons pills) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">

            {Object.keys(plans).map(
              (planKey) => {
                const plan = plans[planKey];
                const isSelected = selectedPlan === planKey;
                const isRecommended = planKey === "annually";

                return (
                  <motion.button
                    key={planKey}
                    type="button"
                    onClick={() => setSelectedPlan(planKey)}
                    aria-pressed={isSelected}
                    aria-label={`Choisir la formule ${plan.label}, ${plan.price} euros par ${plan.duration}`}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`relative text-left rounded-2xl border p-5 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2
                      ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                          : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
                      }`}
                  >
                    {isRecommended && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 text-yellow-900 text-[11px] font-semibold px-3 py-1 shadow-sm select-none">
                        <Sparkles className="w-3 h-3" /> Recommandé
                      </span>
                    )}

                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-3 right-3 inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </motion.span>
                      )}
                    </AnimatePresence>

                    <p className="font-semibold text-gray-900 mb-1">{plan.label}</p>
                    <p className="text-2xl font-extrabold text-gray-900">
                      {plan.price.toFixed(2)} €
                      <span className="text-sm font-medium text-gray-500"> /{plan.duration}</span>
                    </p>
                    <p className="mt-2 text-xs text-gray-500 leading-relaxed">{plan.description}</p>
                  </motion.button>
                );
              }
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

            <motion.button
              onClick={handleStripeCheckout}
              disabled={loading}
              whileHover={!loading ? { y: -2 } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-label={loading ? "Redirection vers Stripe en cours" : `Payer ${currentPlan.price} euros`}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
            >

              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Redirection vers Stripe...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Payer {currentPlan.price} €
                </>
              )}

            </motion.button>

          </div>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-sm text-gray-500">
            <Lock className="w-3.5 h-3.5" /> Paiement sécurisé via Stripe
          </div>

        </motion.section>

        {/* Avantages Premium */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-3xl w-full mt-14"
        >
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Pourquoi devenir Premium ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AVANTAGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Comparaison Gratuit / Premium */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-3xl w-full mt-14"
        >
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Gratuit vs Premium
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left font-semibold px-4 py-3">Fonctionnalité</th>
                  <th className="font-semibold px-4 py-3">Gratuit</th>
                  <th className="font-semibold px-4 py-3 text-indigo-700">Premium</th>
                </tr>
              </thead>
              <tbody>
                {COMPARAISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <td className="px-4 py-3 text-gray-700 font-medium">{row.feature}</td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {row.free === true ? (
                        <Check className="w-4 h-4 text-emerald-500 inline" aria-label="Inclus" />
                      ) : row.free === false ? (
                        <span aria-label="Non inclus" className="text-gray-300">✗</span>
                      ) : (
                        row.free
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-indigo-700">
                      {row.premium === true ? (
                        <Check className="w-4 h-4 text-indigo-600 inline" aria-label="Inclus" />
                      ) : (
                        row.premium
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Sécurité */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-3xl w-full mt-14 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Paiement 100 % sécurisé</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5"><Lock className="w-4 h-4" /> Stripe</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> SSL</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="w-4 h-4" /> Aucune donnée bancaire stockée</span>
          </div>
        </motion.section>

        {/* Confiance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-3xl w-full mt-14"
        >
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Pourquoi faire confiance à Psyconnect ?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONFIANCE.map((label) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 text-center bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl px-3 py-4 shadow-sm"
              >
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-3xl w-full mt-14 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Questions fréquentes
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={item.question}
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left font-medium text-gray-800 transition-colors duration-200 hover:bg-indigo-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-inset"
                  >
                    <span className="text-sm">{item.question}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 text-gray-400"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.section>

      </main>

    </Layout>
  );
};

export default DevenirPremium;