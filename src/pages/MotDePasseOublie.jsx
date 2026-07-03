import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/commun/Layout";
import { forgotPassword } from "../services/serviceAuth";

const MotDePasseOublie = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const getErrorMessage = (err) => {
        const status = err.response?.status;
        const serverMessage = err.response?.data?.message;

        // On ne montre le message serveur que s'il est bien une chaîne lisible
        if (typeof serverMessage === "string" && serverMessage.trim()) {
            return serverMessage;
        }

        if (status === 404) return "Aucun compte n'est associé à cette adresse email.";
        if (status === 429) return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
        if (!err.response) return "Impossible de contacter le serveur. Vérifiez votre connexion.";

        return "Une erreur est survenue. Veuillez réessayer.";
    };

    const envoyer = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setIsError(false);

        try {
            const res = await forgotPassword(email);
            setMessage(res.message || "Un lien de réinitialisation a été envoyé à votre adresse email.");
            setIsError(false);
        } catch (err) {
            setMessage(getErrorMessage(err));
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4">
                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100 p-8 w-full max-w-md border border-slate-100">

                    <Link
                        to="/connexion"
                        className="inline-flex items-center gap-2 text-slate-500 mb-6 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Retour à la connexion
                    </Link>

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-200">
                        <KeyRound className="text-white" size={26} />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        Mot de passe oublié ?
                    </h2>

                    <p className="text-slate-500 mb-7 text-sm leading-relaxed">
                        Entrez votre adresse email afin de recevoir un lien de réinitialisation.
                    </p>

                    <form onSubmit={envoyer} className="space-y-5">
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 disabled:opacity-60"
                                placeholder="Votre adresse email"
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {loading ? "Envoi en cours..." : "Envoyer le lien"}
                        </button>
                    </form>

                    {message && (
                        <div
                            className={`mt-6 flex items-start gap-3 rounded-2xl p-4 border animate-[fadeIn_0.2s_ease-out] ${
                                isError
                                    ? "bg-red-50/70 border-red-100"
                                    : "bg-green-50/70 border-green-100"
                            }`}
                        >
                            <div
                                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    isError ? "bg-red-100" : "bg-green-100"
                                }`}
                            >
                                {isError ? (
                                    <AlertCircle size={16} className="text-red-600" />
                                ) : (
                                    <CheckCircle2 size={16} className="text-green-600" />
                                )}
                            </div>
                            <p className={`text-sm leading-relaxed pt-1 ${isError ? "text-red-700" : "text-green-700"}`}>
                                {message}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MotDePasseOublie;