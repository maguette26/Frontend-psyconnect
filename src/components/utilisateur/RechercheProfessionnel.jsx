// src/components/utilisateur/RechercheProfessionnel.jsx
import React, { useState, useEffect } from 'react';
import { getProfessionnelsValides, creerReservation } from '../../services/serviceUtilisateur';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faDollarSign, faUserMd, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const RechercheProfessionnel = ({ onError, onSuccess }) => {
    const [professionnels, setProfessionnels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPro, setSelectedPro] = useState(null);
    const [reservationDate, setReservationDate] = useState('');
    const [reservationTime, setReservationTime] = useState('');

    useEffect(() => {
        const fetchProfessionnels = async () => {
            try {
                // Cette fonction va appeler '/api/professionnels/tous' et filtrer les validés
                const data = await getProfessionnelsValides(); 
                setProfessionnels(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des professionnels:", error);
                onError("Impossible de charger la liste des professionnels.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfessionnels();
    }, [onError]);

    const handleReserver = async (e) => {
        e.preventDefault();
        onError(null);
        onSuccess(null);

        if (!selectedPro || !reservationDate || !reservationTime) {
            onError("Veuillez sélectionner un professionnel, une date et une heure pour la réservation.");
            return;
        }

        if (!window.confirm(`Confirmer la réservation avec ${selectedPro.prenom} ${selectedPro.nom} le ${new Date(reservationDate).toLocaleDateString('fr-FR')} à ${reservationTime} ?`)) {
            return;
        }

        try {
            const reservationDetails = {
                professionnel: { id: selectedPro.id }, // Envoyer seulement l'ID du professionnel
                dateReservation: reservationDate, // Format YYYY-MM-DD
                heureDebut: reservationTime,      // Format HH:MM
            };
            await creerReservation(reservationDetails); // Utilise la fonction creerReservation
            onSuccess("Votre demande de réservation a été envoyée avec succès ! Le professionnel la validera.");
            setSelectedPro(null); // Réinitialiser le formulaire
            setReservationDate('');
            setReservationTime('');
        } catch (error) {
            console.error("Erreur lors de la réservation:", error);
            const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de la réservation.";
            onError(errorMessage);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-600">Chargement des professionnels disponibles...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Trouver un Professionnel</h2>

            {/* Liste des professionnels */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {professionnels.length > 0 ? (
                    professionnels.map((pro) => (
                        <div
                            key={pro.id}
                            className={`bg-white rounded-lg shadow-md p-6 border-2 cursor-pointer
                                ${selectedPro?.id === pro.id ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200 hover:shadow-lg'}`}
                            onClick={() => setSelectedPro(pro)}
                        >
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                <FontAwesomeIcon icon={faUserMd} className="mr-2 text-indigo-600" />
                                {pro.prenom} {pro.nom}
                            </h3>
                            <p className="text-gray-700 text-sm mb-1">{pro.specialite}</p>
                            <p className="text-gray-600 text-sm mb-2">
                                <FontAwesomeIcon icon={faEnvelope} className="mr-1" /> {pro.email}
                            </p>
                            {pro.prixConsultation !== undefined && pro.prixConsultation !== null && (
                                <p className="text-lg font-bold text-indigo-700">
                                    <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                                    {pro.prixConsultation.toFixed(2)} $ / consultation
                                </p>
                            )}
                            {/* Afficher les disponibilités du professionnel ici (optionnel, nécessite une API pour ça) */}
                            {/* <div className="mt-3 text-sm text-gray-600">
                                    <p className="font-semibold">Prochaines disponibilités:</p>
                                    <ul className="list-disc list-inside">
                                        <li>...</li>
                                    </ul>
                                </div> */}
                            <button
                                onClick={() => setSelectedPro(pro)}
                                className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {selectedPro?.id === pro.id ? 'Sélectionné' : 'Sélectionner ce pro'}
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-600">Aucun professionnel disponible pour le moment.</p>
                )}
            </div>

            {/* Formulaire de réservation (visible si un professionnel est sélectionné) */}
            {selectedPro && (
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg border border-indigo-300">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Réserver avec {selectedPro.prenom} {selectedPro.nom}</h3>
                    <form onSubmit={handleReserver} className="space-y-4">
                        <div>
                            <label htmlFor="reservationDate" className="block text-sm font-medium text-gray-700">Date de la consultation :</label>
                            <input
                                type="date"
                                id="reservationDate"
                                value={reservationDate}
                                onChange={(e) => setReservationDate(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="reservationTime" className="block text-sm font-medium text-gray-700">Heure de la consultation :</label>
                            <input
                                type="time"
                                id="reservationTime"
                                value={reservationTime}
                                onChange={(e) => setReservationTime(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Demander une réservation
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RechercheProfessionnel;
