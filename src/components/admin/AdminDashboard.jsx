// src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout'; 
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userRole = localStorage.getItem('role'); // Le rôle stocké peut être 'ADMIN', 'UTILISATEUR', etc.

        if (userRole === 'ADMIN') {
            setIsAdmin(true);
        } else {
            console.warn(`Accès non autorisé au tableau de bord administrateur pour le rôle : ${userRole}. Redirection...`);
            
            // Redirection spécifique en fonction du rôle si l'utilisateur n'est PAS ADMIN
            switch (userRole) {
                case 'UTILISATEUR':
                    navigate('/tableauUtilisateur');
                    break;
                case 'PSYCHIATRE':
                case 'PSYCHOLOGUE':
                    navigate('/tableauProfessionnel');
                    break;
                default:
                    navigate('/'); // Redirection par défaut si non connecté ou rôle inconnu
                    break;
            }
            alert("Accès refusé. Vous n'avez pas les permissions d'administrateur.");
        }
        setLoading(false);
    }, [navigate]);

    if (loading) {
        return (
            // Utilise AdminLayout pour l'état de chargement aussi, pour une cohérence visuelle
            <AdminLayout> 
                <div className="flex-grow flex items-center justify-center py-8">
                    Chargement du tableau de bord...
                </div>
            </AdminLayout>
        );
    }

    if (!isAdmin) {
        // Ne rien afficher si ce n'est pas un admin (la redirection a déjà eu lieu dans useEffect)
        return null;
    }

    return (
        <AdminLayout> {/* AdminLayout enveloppe tout le contenu du tableau de bord */}
            <div className="flex-grow py-8 px-4 max-w-7xl mx-auto w-full text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Bienvenue, Administrateur !</h1>
                <p className="text-lg text-gray-700">
                    C'est votre espace de gestion centralisée. Utilisez la barre de navigation en haut pour accéder aux différentes sections administratives.
                </p>
                {/* Vous pouvez ajouter d'autres éléments de bienvenue ou des instructions ici si nécessaire */}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;