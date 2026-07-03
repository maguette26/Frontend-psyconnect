import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, Check } from "lucide-react";
import Layout from "../components/commun/Layout";
import { resetPassword } from "../services/serviceAuth";

const getErrorMessage = (err) => {
    const status = err.response?.status;
    const serverMessage = err.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage.trim()) return serverMessage;
    if (status === 400 || status === 404) return "Ce lien de réinitialisation est invalide ou a expiré.";
    if (status === 429) return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
    if (!err.response) return "Impossible de contacter le serveur. Vérifiez votre connexion.";
    return "Une erreur est survenue. Veuillez réessayer.";
};

const evaluerForce = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 à 4
};

const ResetPassword = () => {
    const [params] = useSearchParams();
    const token = params.get("token");
    const navigate = useNavigate();

    const [motDePasse, setMotDePasse] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [erreur, setErreur] = useState("");
    const [succes, setSucces] = useState("");
    const [loading, setLoading] = useState(false);

    const force = useMemo(() => evaluerForce(motDePasse), [motDePasse]);
    const forceLabel = ["Très faible", "Faible", "Moyen", "Bon", "Mot de passe fort"][force];
    const forceColor = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-500"][force];

    const criteres = [
        { label: "Au moins 8 caractères", ok: motDePasse.length >= 8 },
        { label: "Inclure des chiffres et des lettres", ok: /[a-zA-Z]/.test(motDePasse) && /\d/.test(motDePasse) },
        { label: "Utiliser des caractères spéciaux (!@#$%)", ok: /[^A-Za-z0-9]/.test(motDePasse) },
    ];

    const modifier = async (e) => {
        e.preventDefault();
        setErreur("");
        setSucces("");

        if (!token) {
            setErreur("Ce lien de réinitialisation est invalide ou incomplet.");
            return;
        }
        if (motDePasse.length < 8) {
            setErreur("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }
        if (motDePasse !== confirm) {
            setErreur("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword(token, motDePasse);
            setSucces(res.message || "Votre mot de passe a été modifié avec succès.");
            setTimeout(() => navigate("/connexion"), 2500);
        } catch (err) {
            setErreur(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex justify-center items-center px-4 py-10">
                <div className="w-full max-w-md">

                    <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/60 border border-slate-100 p-8">

                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center">
                                    <KeyRound className="text-white" size={26} />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                            Nouveau mot de passe
                        </h2>
                        <p className="text-slate-500 text-sm text-center mb-7 leading-relaxed">
                            Choisissez un nouveau mot de passe sécurisé pour votre compte.
                        </p>

                        <form onSubmit={modifier} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type={showPwd ? "text" : "password"}
                                        disabled={loading}
                                        value={motDePasse}
                                        onChange={(e) => setMotDePasse(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {motDePasse && (
                                    <div className="flex items-center gap-2 mt-2">
                                        {force >= 3 && <Check size={14} className="text-green-600" />}
                                        <span className={`text-xs font-medium ${force >= 3 ? "text-green-600" : "text-slate-500"}`}>
                                            {forceLabel}
                                        </span>
                                        <div className="flex gap-1 ml-auto flex-1">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 rounded-full ${i < force ? forceColor : "bg-slate-200"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        disabled={loading}
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {erreur && (
                                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3.5">
                                    {erreur}
                                </div>
                            )}
                            {succes && (
                                <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3.5">
                                    {succes}
                                    <span className="block text-xs text-green-600 mt-1">Redirection vers la connexion...</span>
                                </div>
                            )}

                            <button
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                            >
                                <Lock size={17} />
                                {loading ? "Modification..." : "Réinitialiser mon mot de passe"}
                            </button>
                        </form>

                        <div className="mt-6 flex items-start gap-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4">
                            <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                            <div className="w-full">
                                <p className="text-sm font-semibold text-indigo-700 mb-2">
                                    Conseils pour un mot de passe sécurisé
                                </p>
                                <ul className="space-y-1.5">
                                    {criteres.map((c) => (
                                        <li key={c.label} className="flex items-center gap-2 text-xs">
                                            <Check size={13} className={c.ok ? "text-green-600" : "text-slate-300"} />
                                            <span className={c.ok ? "text-slate-600" : "text-slate-400"}>{c.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ResetPassword;