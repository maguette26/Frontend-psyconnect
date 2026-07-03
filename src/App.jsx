import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Chatbot from './components/Chatbot';
import Layout from './components/commun/Layout';

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
import PremiumSuccess from './pages/PremiumSuccess';

import MotDePasseOublie from "./pages/MotDePasseOublie";
import ResetPassword from "./pages/ResetPassword";

function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; }
      body { margin: 0; }
      textarea { font-family: Inter, sans-serif; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

function AppWrapper() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authState, setAuthState] = useState("loading");

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setAuthState("unauthenticated");
      return;
    }

    getMe()
      .then((user) => {
        setCurrentUser(user);
        setAuthState("authenticated");
      })
      .catch(() => {
        setCurrentUser(null);
        setAuthState("unauthenticated");
      });
  }, []);

  if (authState === "loading") return null;

  const isAuth = authState === "authenticated";

  return (
    <RessourceProvider>
      <GlobalStyles />

      <div style={{ minHeight: "100vh" }}>

        <Routes>

          {/* 🌍 PUBLIC + LAYOUT (HEADER + FOOTER) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Accueil />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/ressources" element={<Ressources />} />
            <Route path="/apropos" element={<APropos />} />
            <Route path="/reservation" element={<ListeProfessionnels />} />

            <Route path="/mini-defi-gratuite" element={<MiniDefiGratuite />} />
            <Route path="/mini-defi-decouverte" element={<MiniDefiDecouverte />} />
            <Route path="/guide-fixateur-limites" element={<GuideFixateurLimites />} />
            <Route path="/auto-evaluation-basique" element={<AutoEvaluationBasique />} />
            <Route path="/analyse-emotionnelle" element={<EmotionAnalyzer />} />
            <Route path="/liste-controle-bien-etre" element={<ListeControleBienEtre />} />
          </Route>

          {/* 🔐 AUTH */}
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/inscription/utilisateur" element={<InscriptionUser />} />
          <Route path="/inscription/professionnel" element={<InscriptionProfessionnel />} />

          {/* 👤 DASHBOARD */}
          <Route
            path="/consultations"
            element={isAuth ? <ConsultationsPage /> : <Navigate to="/connexion" replace />}
          />

          <Route
            path="/consultations/pro"
            element={isAuth ? <TableauProfessionnel /> : <Navigate to="/connexion" replace />}
          />

          <Route
            path="/chat/:consultationId"
            element={isAuth ? <ChatPage currentUser={currentUser} /> : <Navigate to="/connexion" replace />}
          />

          <Route path="/access/consultation/:id" element={<ConsultationAccessPage />} />

          {/* 💳 PREMIUM */}
          <Route path="/devenir-premium" element={<DevenirPremium />} />
          <Route path="/premium-success" element={<PremiumSuccess />} />
          <Route path="/premium-cancel" element={<DevenirPremium />} />

          {/* 👑 ADMIN */}
          <Route path="/tableauAdmin" element={<TableauAdmin />} />
          <Route path="/tableauUtilisateur" element={<TableauUtilisateur />} />
          <Route path="/tableauProfessionnel" element={<TableauProfessionnel />} />

          {/* 🔑 PASSWORD */}
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ❌ 404 */}
          <Route path="*" element={<Page404 />} />

        </Routes>
      </div>
    </RessourceProvider>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppWrapper />
    </Router>
  );
}