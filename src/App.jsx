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
import { getMe } from './services/api';
import ConsultationAccessPage from './pages/ConsultationAccessPage';

// ⚠️ Importe ces deux si tu les utilises, sinon supprime-les
 import { useBackendWarmup } from './hooks/useBackendWarmup';
 import WarmupScreen from './components/WarmupScreen';

function AppWrapper() {
  const location = useLocation();

  const [chatOpen, setChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ⚠️ useEffect doit être AVANT tout return conditionnel
  useEffect(() => {
    getMe()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // ✅ Ces returns conditionnels viennent APRÈS les hooks
  if (authLoading) return <div>Chargement...</div>;

  return (
    <RessourceProvider>
      <Header onOpenChat={() => setChatOpen(true)} />

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
        <Route path="/mini-defi-gratuite" element={<MiniDefiGratuite />} />
        <Route path="/mini-defi-decouverte" element={<MiniDefiDecouverte />} />
        <Route path="/guide-fixateur-limites" element={<GuideFixateurLimites />} />
        <Route path="/auto-evaluation-basique" element={<AutoEvaluationBasique />} />
        <Route path="/analyse-emotionnelle" element={<EmotionAnalyzer />} />
        <Route path="/liste-controle-bien-etre" element={<ListeControleBienEtre />} />
        <Route path="/consultations" element={<ConsultationsPage />} />
        <Route path="/access/consultation/:id" element={<ConsultationAccessPage />} />
        <Route
          path="/chat/:consultationId"
          element={
            currentUser
              ? <ChatPage currentUser={currentUser} />
              : <Navigate to="/connexion" />
          }
        />
        <Route path="/payment-cancel" element={<Navigate to="/" replace />} />
        {/* ✅ Un seul catch-all à la fin */}
        <Route path="*" element={<Page404 />} />
      </Routes>
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