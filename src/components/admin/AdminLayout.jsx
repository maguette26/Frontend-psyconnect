
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleDeconnexion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/connexion');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
                        PsyConnect
                    </Link>
                    <nav className="flex items-center space-x-6 text-gray-700 text-sm font-medium">
                        <Link to="/tableauAdmin" className="hover:text-indigo-600 transition">Tableau Admin</Link>
                        <button onClick={handleDeconnexion} className="ml-4 text-red-600 hover:underline">Déconnexion</button>
                    </nav>
                </div>
            </header>

            <main className="flex-grow">
                {children} {/* Ici le contenu des pages admin */}
            </main>

            <footer className="bg-indigo-50 text-indigo-600 text-center py-6 mt-24">
                <p>&copy; 2025 PsyConnect. Tous droits réservés.</p>
            </footer>
        </div>
    );
};

export default AdminLayout;