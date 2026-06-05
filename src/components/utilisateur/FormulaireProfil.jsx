import React, { useState, useEffect } from 'react';
import { getProfil, modifierProfil } from '../../services/serviceUtilisateur';
import { motion, AnimatePresence } from 'framer-motion';

const initialProfil = {
    id: null,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    nouveauMotDePasse: '',
    confirmNouveauMotDePasse: ''
};

const InputField = ({ label, type, name, value, onChange, readOnly = false, required = false }) => (
    <div className="relative w-full group">
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            required={required}
            placeholder=" "
            className={`peer block w-full px-2 pt-6 pb-2 text-md bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-indigo-600 
            ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'text-gray-900'}`}
        />
        <label
            htmlFor={name}
            className="absolute text-sm text-gray-500 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-3 peer-focus:scale-75 peer-focus:-translate-y-5"
        >
            {label}
        </label>
    </div>
);

const FormulaireProfil = () => {
    const [profil, setProfil] = useState(initialProfil);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const chargerProfil = async () => {
            try {
                const data = await getProfil();
                if (data?.email) {
                    setProfil(prev => ({
                        ...prev,
                        id: data.id ?? null,
                        nom: data.nom ?? '',
                        prenom: data.prenom ?? '',
                        email: data.email,
                        telephone: data.telephone ?? ''
                    }));
                } else {
                    throw new Error("Utilisateur non connecté.");
                }
            } catch (err) {
                setError(err.message || "Erreur lors du chargement.");
            } finally {
                setLoading(false);
            }
        };
        chargerProfil();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfil(prev => ({ ...prev, [name]: value }));
    };

    const validerChamps = () => {
        const { nom, prenom, telephone, nouveauMotDePasse, confirmNouveauMotDePasse } = profil;
        if (!nom || !prenom || !telephone) return "Tous les champs sont obligatoires.";
        if (nouveauMotDePasse && nouveauMotDePasse.length < 6) return "Mot de passe trop court.";
        if (nouveauMotDePasse !== confirmNouveauMotDePasse) return "Les mots de passe ne correspondent pas.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const erreur = validerChamps();
        if (erreur) return setError(erreur);

        const { nom, prenom, telephone, nouveauMotDePasse } = profil;
        const donneesAEnvoyer = {
            nom: nom.trim(),
            prenom: prenom.trim(),
            telephone: telephone.trim(),
            ...(nouveauMotDePasse && { motDePasse: nouveauMotDePasse })
        };

        try {
            await modifierProfil(donneesAEnvoyer);
            setSuccess(true);
            setProfil(prev => ({ ...prev, nouveauMotDePasse: '', confirmNouveauMotDePasse: '' }));
        } catch (err) {
            setError(err.response?.data?.message || "Erreur inattendue.");
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Chargement...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-xl mt-12 border border-gray-100">
           
            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
                    >
                        ✅ Profil mis à jour avec succès !
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField label="Nom" type="text" name="nom" value={profil.nom} onChange={handleChange} required />
                <InputField label="Prénom" type="text" name="prenom" value={profil.prenom} onChange={handleChange} required />
                <InputField label="Email" type="email" name="email" value={profil.email} onChange={handleChange} readOnly />
                <InputField label="Téléphone" type="text" name="telephone" value={profil.telephone} onChange={handleChange} required />
                <InputField label="Nouveau mot de passe" type="password" name="nouveauMotDePasse" value={profil.nouveauMotDePasse} onChange={handleChange} />
                <InputField label="Confirmer le mot de passe" type="password" name="confirmNouveauMotDePasse" value={profil.confirmNouveauMotDePasse} onChange={handleChange} />

                {/* BOUTON CENTRÉ */}
                <div className="md:col-span-2 flex justify-center mt-4">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
                    >
                        💾 Enregistrer  
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormulaireProfil;
