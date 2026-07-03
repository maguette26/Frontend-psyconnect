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

    const modifier = async (e) => {
        e.preventDefault();

        if (motDePasse !== confirm) {
            setMessage("Les mots de passe ne correspondent pas.");
            setIsError(true);
            return;
        }

        setLoading(true);
        setIsError(false);

        try {
            const res = await resetPassword(token, motDePasse);
            setMessage(res.message);
            setIsError(false);

            setTimeout(() => {
                navigate("/connexion");
            }, 2500);
        } catch (err) {
            setMessage(err.response?.data?.message || "Lien invalide.");
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
                                className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700"
                                value={motDePasse}
                                onChange={(e) => setMotDePasse(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(!showPwd)}
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
                                className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirm ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>

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
                            className={`mt-5 flex items-start gap-2 text-sm rounded-xl p-3.5 ${
                                isError
                                    ? "bg-red-50 text-red-600 border border-red-100"
                                    : "bg-green-50 text-green-700 border border-green-100"
                            }`}
                        >
                            {isError ? (
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            ) : (
                                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                            )}
                            <span>{message}</span>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ResetPassword;