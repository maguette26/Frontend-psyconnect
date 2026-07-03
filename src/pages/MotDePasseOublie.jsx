import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/commun/Layout";
import { forgotPassword } from "../services/serviceAuth";

const MotDePasseOublie = () => {

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const envoyer = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try{
            const res = await forgotPassword(email);
            setMessage(res.message);
        }
        catch(err){
            setMessage(
                err.response?.data?.message ||
                "Une erreur est survenue."
            );
        }
        finally{
            setLoading(false);
        }
    }

    return(
        <Layout>

            <div className="min-h-screen flex justify-center items-center bg-slate-100">

                <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">

                    <Link
                        to="/connexion"
                        className="flex items-center gap-2 text-blue-600 mb-6 hover:underline"
                    >
                        <ArrowLeft size={18}/>
                        Retour
                    </Link>

                    <h2 className="text-3xl font-bold mb-2">
                        Mot de passe oublié
                    </h2>

                    <p className="text-gray-500 mb-6">
                        Entrez votre adresse email afin de recevoir un lien de réinitialisation.
                    </p>

                    <form onSubmit={envoyer}>

                        <div className="relative">

                            <Mail className="absolute left-3 top-3.5 text-gray-400"/>

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e)=>setEmail(e.target.value)}
                                className="w-full pl-10 py-3 border rounded-xl"
                                placeholder="Votre adresse email"
                            />

                        </div>

                        <button
                            disabled={loading}
                            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                        >
                            {loading ? "Envoi..." : "Envoyer le lien"}
                        </button>

                    </form>

                    {
                        message &&
                        <div className="mt-5 text-center text-sm text-green-600">
                            {message}
                        </div>
                    }

                </div>

            </div>

        </Layout>
    )

}

export default MotDePasseOublie;