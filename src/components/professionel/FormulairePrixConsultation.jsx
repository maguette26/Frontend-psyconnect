// src/components/professionel/FormulairePrixConsultation.jsx
import React, { useState, useEffect } from 'react';

const FormulairePrixConsultation = ({ onSubmit, onError, onSuccess, currentPrice: initialPrice }) => {
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialPrice !== null && initialPrice !== undefined) {
            setPrice(initialPrice.toString());
        }
        setLoading(false);
    }, [initialPrice]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        onError(null);
        onSuccess(null);

        const parsedPrice = parseFloat(price);

        if (isNaN(parsedPrice) || parsedPrice < 0) {
            onError("Veuillez entrer un prix valide et positif.");
            return;
        }

        try {
            await onSubmit(parsedPrice); // Appelle la fonction onSubmit passée par le parent
            onSuccess("Prix de consultation enregistré avec succès !");
        } catch (error) {
            onError("Erreur lors de l'enregistrement du prix : " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return <div className="text-center text-gray-600">Chargement du prix...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Définir ou Mettre à jour votre prix de consultation</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="consultationPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Prix de la consultation (en USD)
                    </label>
                    <input
                        type="number"
                        id="consultationPrice"
                        name="consultationPrice"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Ex: 50.00"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Enregistrer le prix
                </button>
            </form>
        </div>
    );
};

export default FormulairePrixConsultation;
