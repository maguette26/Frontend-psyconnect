import React, { useState } from "react";
import { Mail, ArrowLeft, ShieldCheck, Send, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/commun/Layout";
import { forgotPassword } from "../services/serviceAuth";

const Logo = () => (
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600" fill="currentColor">
                <path d="M12 2a5 5 0 0 0-5 5c0 1.1.36 2.11.97 2.93A4 4 0 0 0 5 13.5 4 4 0 0 0 8 17.4V20a1 1 0 0 0 1 1h2v-3h2v3h2a1 1 0 0 0 1-1v-2.6a4 4 0 0 0 3-3.9 4 4 0 0 0-2.97-3.57A5 5 0 0 0 17 7a5 5 0 0 0-5-5z"/>
            </svg>
        </div>
        <div>
            <div className="font-bold text-lg text-slate-800">
                Psy<span className="text-blue-600">Connect</span>
            </div>
            <div className="text-xs text-slate-400">Votre bien-être, notre priorité</div>
        </div>
    </div>
);

const getErrorMessage = (err) => {
    const status = err.response?.status;
    const serverMessage = err.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage.trim()) return serverMessage;
    if (status === 429) return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
    if (!err.response) return "Impossible de contacter le serveur. Vérifiez votre connexion.";
    return "Une erreur est survenue. Veuillez réessayer.";
};

const MotDePasseOublie = () => {
    const [email, setEmail] = useState("");
    const [envoye, setEnvoye] = useState(false);
    const [erreur, setErreur] = useState("");
    const [loading, setLoading] = useState(false);

    const envoyer = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErreur("");

        try {
            await forgotPassword(email);
            setEnvoye(true);
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

                    <div className="flex justify-between items-center mb-6">
                        <Logo />
                        <Link
                            to="/connexion"
                            className="flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:underline"
                        >
                            <ArrowLeft size={16} />
                            Retour à la connexion
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/60 border border-slate-100 p-8 relative overflow-hidden">

                        {!envoye ? (
                            <>
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Mail className="text-blue-500" size={40} strokeWidth={1.5} />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border-4 border-white">
                                            <Send size={14} className="text-white" />
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                                    Mot de passe oublié ?
                                </h2>
                                <p className="text-slate-500 text-sm text-center mb-7 leading-relaxed">
                                    Pas de souci ! Entrez votre adresse e-mail et nous vous
                                    enverrons un lien pour réinitialiser votre mot de passe.
                                </p>

                                <form onSubmit={envoyer} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Adresse e-mail
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                required
                                                disabled={loading}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="exemple@email.com"
                                                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 disabled:opacity-60"
                                            />
                                        </div>
                                    </div>

                                    {erreur && (
                                        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3.5">
                                            {erreur}
                                        </div>
                                    )}

                                    <button
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                                    >
                                        <Send size={17} />
                                        {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                                    </button>
                                </form>

                                <div className="mt-6 flex items-start gap-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4">
                                    <div className="shrink-0 w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <ShieldCheck size={18} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-700">Sécurité garantie</p>
                                        <p className="text-xs text-indigo-500 mt-0.5">
                                            Nous ne partagerons jamais votre e-mail avec qui que ce soit.
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
                                            <Mail className="text-green-500" size={38} strokeWidth={1.5} />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-green-500 flex items-center justify-center border-4 border-white">
                                            <MailCheck size={16} className="text-white" />
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                                    E-mail envoyé !
                                </h2>
                                <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
                                    Si un compte est associé à l'adresse e-mail saisie, vous
                                    recevrez un lien de réinitialisation dans quelques minutes.
                                </p>

                                <div className="flex items-start gap-3 bg-green-50/70 border border-green-100 rounded-2xl p-4 mb-6">
                                    <Mail size={18} className="text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-green-700">
                                            Pensez à vérifier votre boîte de réception
                                        </p>
                                        <p className="text-xs text-green-600 mt-0.5">
                                            N'oubliez pas de consulter vos courriers indésirables (Spam).
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    to="/connexion"
                                    className="w-full flex items-center justify-center gap-2 border border-blue-200 text-blue-600 font-semibold py-3.5 rounded-xl hover:bg-blue-50 transition-colors"
                                >
                                    <ArrowLeft size={17} />
                                    Retour à la connexion
                                </Link>

                                <p className="text-center text-sm text-slate-400 mt-6">
                                    Besoin d'aide ?{" "}
                                    <a href="mailto:support@psyconnect.com" className="text-blue-600 hover:underline">
                                        Contactez notre support
                                    </a>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MotDePasseOublie;