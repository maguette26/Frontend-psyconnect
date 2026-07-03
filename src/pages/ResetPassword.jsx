import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import Layout from "../components/commun/Layout";
import { resetPassword } from "../services/serviceAuth";

const ResetPassword = () => {
    const [params] = useSearchParams();
    const token = params.get("token");
    const navigate = useNavigate();

    const [motDePasse, setMotDePasse] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const getErrorMessage = (err) => {
        const status = err.response?.status;
        const serverMessage = err.response?.data?.message;

        if (typeof serverMessage === "string" && serverMessage.trim()) {
            return serverMessage;
        }

        if (status === 400 || status === 404) {
            return "Ce lien de réinitialisation est invalide ou a expiré.";
        }
        if (status === 429) {
            return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
        }
        if (!err.response) {
            return "Impossible de contacter le serveur. Vérifiez votre connexion.";
        }

        return "Une erreur est survenue. Veuillez réessayer.";
    };

    const modifier = async (e) => {
        e.preventDefault();

        if (!token) {
            setMessage("Ce lien de réinitialisation est invalide ou incomplet.");
            setIsError(true);
            return;
        }

        if (motDePasse.length < 8) {
            setMessage("Le mot de passe doit contenir au moins 8 caractères.");
            setIsError(true);
            return;
        }

        if (motDePasse !== confirm) {
            setMessage("Les mots de passe ne correspondent pas.");
            setIsError(true);
            return;
        }

        setLoading(true);
        setMessage("");
        setIsError(false);

        try {
            const res = await resetPassword(token, motDePasse);
            setMessage(res.message || "Votre mot de passe a été modifié avec succès.");
            setIsError(false);

            setTimeout(() => {
                navigate("/connexion");
            }, 2500);
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

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-200">
                        <ShieldCheck className="text-white" size={26} />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        Nouveau mot de passe
                    </h2>

                    <p className="text-slate-500 mb-7 text-sm leading-relaxed">
                        Choisissez un nouveau mot de passe sécurisé pour votre compte.
                    </p>

                    <form onSubmit={modifier} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                            <input
                                type={showPwd ? "text" : "password"}
                                placeholder="Nouveau mot de passe"
                                disabled={loading}
                                className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 disabled:opacity-60"
                                value={motDePasse}
                                onChange={(e) => setMotDePasse(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(!showPwd)}
                                tabIndex={-1}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPwd ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirmer le mot de passe"
                                disabled={loading}
                                className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 disabled:opacity-60"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                tabIndex={-1}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirm ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 pl-1">
                            8 caractères minimum.
                        </p>

                        <button
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {loading ? "Modification..." : "Modifier le mot de passe"}
                        </button>
                    </form>

                    {message && (
                        <div
                            className={`mt-6 flex items-start gap-3 rounded-2xl p-4 border ${
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
                                {!isError && (
                                    <span className="block text-xs text-green-600 mt-1">
                                        Redirection vers la connexion...
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ResetPassword;