// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Chatbot from './components/Chatbot';
import Header from './components/commun/header';

import Accueil from './pages/Accueil';
import Inscription from './pages/Inscription';
import InscriptionUser from './pages/InscriptionUser';
import InscriptionProfessionnel from './pages/InscriptionProfessionnel';
import Connexion from './pages/Connexion';
import Ressources from './pages/Ressources';
import Forum from './pages/Forum';
import TableauUtilisateur from './pages/TableauUtilisateur';
import TableauAdmin from './pages/TableauAdmin';
import TableauProfessionnel from './pages/TableauProfessionnel';
import DevenirPremium from './pages/DevenirPremium';
import APropos from './pages/APropos';
import ListeProfessionnels from './components/ListeProfessionnels';
import MiniDefiGratuite from './pages/MiniDefiGratuite';
import MiniDefiDecouverte from './pages/MiniDefiDecouverte';
import GuideFixateurLimites from './pages/GuideFixateurLimites';
import AutoEvaluationBasique from './pages/AutoEvaluationBasique';
import EmotionAnalyzer from './pages/EmotionAnalyzer';
import ListeControleBienEtre from './pages/ListeControleBienEtre';
import Page404 from './pages/Page404';
import ScrollToTop from './ScrollToTop';
import { RessourceProvider } from './pages/RessourceContext';

import ChatPage from "./pages/ChatPage";
import ConsultationsPage from './pages/ConsultationsPage';
import ConsultationAccessPage from './pages/ConsultationAccessPage';

import { getMe } from './services/api';

// ❌ routes sans header
const ROUTES_SANS_HEADER = ['/chat/'];

function AppWrapper() {
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [appReady, setAppReady] = useState(false);

  // 🔐 AUTH CHECK (safe)
  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((user) => {
        if (isMounted) setCurrentUser(user);
      })
      .catch(() => {
        if (isMounted) setCurrentUser(null);
      })
      .finally(() => {
        if (isMounted) setAppReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const hideHeader = ROUTES_SANS_HEADER.some(r =>
    location.pathname.startsWith(r)
  );

  const afficherHeader = !hideHeader;

  // 🚀 IMPORTANT : évite le crash DOM
  if (!appReady) {
    return null; // pas de "Chargement" → évite removeChild bug
  }

  return (
    <RessourceProvider>
      <div style={{ minHeight: "100vh" }}>

        {afficherHeader && (
          <Header onOpenChat={() => {}} />
        )}

        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/inscription/utilisateur" element={<InscriptionUser />} />
          <Route path="/inscription/professionnel" element={<InscriptionProfessionnel />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/ressources" element={<Ressources />} />
          <Route path="/forum" element={<Forum />} />

          <Route path="/devenir-premium" element={<DevenirPremium />} />
          <Route path="/tableauAdmin" element={<TableauAdmin />} />
          <Route path="/tableauUtilisateur" element={<TableauUtilisateur />} />
          <Route path="/tableauProfessionnel" element={<TableauProfessionnel />} />
          <Route path="/apropos" element={<APropos />} />
          <Route path="/reservation" element={<ListeProfessionnels />} />

          {/* Consultations */}
          <Route
            path="/consultations"
            element={currentUser ? <ConsultationsPage /> : <Navigate to="/connexion" />}
          />

          <Route
            path="/consultations/pro"
            element={currentUser ? <TableauProfessionnel /> : <Navigate to="/connexion" />}
          />

          <Route path="/access/consultation/:id" element={<ConsultationAccessPage />} />

          {/* Chat */}
          <Route
            path="/chat/:consultationId"
            element={
              currentUser
                ? <ChatPage currentUser={currentUser} />
                : <Navigate to="/connexion" />
            }
          />

          <Route path="*" element={<Page404 />} />
        </Routes>

      </div>
    </RessourceProvider>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppWrapper />
    </Router>
  );
}

export default App;