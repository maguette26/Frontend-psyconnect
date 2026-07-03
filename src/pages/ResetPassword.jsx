import React,{useState} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/commun/Layout";
import { resetPassword } from "../services/serviceAuth";

const ResetPassword = () => {

    const [params] = useSearchParams();

    const token = params.get("token");

    const navigate = useNavigate();

    const [motDePasse,setMotDePasse]=useState("");
    const [confirm,setConfirm]=useState("");

    const [message,setMessage]=useState("");

    const [loading,setLoading]=useState(false);

    const modifier = async(e)=>{

        e.preventDefault();

        if(motDePasse!==confirm){

            setMessage("Les mots de passe ne correspondent pas.");

            return;

        }

        setLoading(true);

        try{

            const res = await resetPassword(token,motDePasse);

            setMessage(res.message);

            setTimeout(()=>{

                navigate("/connexion");

            },2500);

        }

        catch(err){

            setMessage(

                err.response?.data?.message ||

                "Lien invalide."

            );

        }

        finally{

            setLoading(false);

        }

    }

    return(

        <Layout>

            <div className="min-h-screen flex justify-center items-center bg-slate-100">

                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">

                    <h2 className="text-3xl font-bold mb-2">

                        Nouveau mot de passe

                    </h2>

                    <p className="text-gray-500 mb-6">

                        Choisissez un nouveau mot de passe.

                    </p>

                    <form onSubmit={modifier} className="space-y-4">

                        <input
                            type="password"
                            placeholder="Nouveau mot de passe"
                            className="w-full border rounded-xl p-3"
                            value={motDePasse}
                            onChange={(e)=>setMotDePasse(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            className="w-full border rounded-xl p-3"
                            value={confirm}
                            onChange={(e)=>setConfirm(e.target.value)}
                            required
                        />

                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3"
                        >

                            {

                                loading

                                ?

                                "Modification..."

                                :

                                "Modifier"

                            }

                        </button>

                    </form>

                    {

                        message &&

                        <div className="text-center mt-5">

                            {message}

                        </div>

                    }

                </div>

            </div>

        </Layout>

    )

}

export default ResetPassword;