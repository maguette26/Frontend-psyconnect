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
import PremiumSuccess from './pages/PremiumSuccess';

function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 99px; }
      ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      textarea { font-family: 'Inter', sans-serif; }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);
  return null;
}

const ROUTES_SANS_HEADER = ['/chat/'];

function AppWrapper() {
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  // ✅ 3 états distincts : "loading" | "authenticated" | "unauthenticated"
  const [authState, setAuthState] = useState("loading");

  useEffect(() => {
  let isMounted = true;
  const token = localStorage.getItem('token');

  if (!token) {
    setAuthState("unauthenticated");
    return;
  }

  getMe()
    .then((user) => {
      if (isMounted) {
        setCurrentUser(user);
        setAuthState("authenticated");
      }
    })
    .catch(() => {
      if (isMounted) {
        setCurrentUser(null);
        setAuthState("unauthenticated");
      }
    });

  return () => { isMounted = false; };
}, []);

  const hideHeader = ROUTES_SANS_HEADER.some(r => location.pathname.startsWith(r));
  const afficherHeader = !hideHeader;

  // ✅ Tant que l'auth est en cours, on n'affiche rien
  // (évite le redirect vers /connexion avant que getMe() réponde)
  if (authState === "loading") return null;

  const isAuth = authState === "authenticated";

  return (
    <RessourceProvider>
      <GlobalStyles />
      <div style={{ minHeight: "100vh" }}>
        

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
                    <Route path="/liste-controle-bien-etre" element={<ListeControleBienEtre />} />
                    <Route path="/mini-defi-decouverte" element={<MiniDefiDecouverte />} />
                    <Route path="/guide-fixateur-limites" element={<GuideFixateurLimites />} />
                    <Route path="/auto-evaluation-basique" element={<AutoEvaluationBasique />} />
                    <Route path="/analyse-emotionnelle" element={<EmotionAnalyzer />} />
          <Route
            path="/consultations"
            element={isAuth ? <ConsultationsPage /> : <Navigate to="/connexion" replace />}
          />
          <Route
            path="/consultations/pro"
            element={isAuth ? <TableauProfessionnel /> : <Navigate to="/connexion" replace />}
          />
          <Route path="/access/consultation/:id" element={<ConsultationAccessPage />} />
          {/* ✅ currentUser passé en prop pour que ChatPage connaisse le user connecté */}
          <Route
            path="/chat/:consultationId"
            element={isAuth ? <ChatPage currentUser={currentUser} /> : <Navigate to="/connexion" replace />}
          />
          <Route path="/premium-success" element={<PremiumSuccess />} />
          <Route path="/premium-cancel" element={<DevenirPremium />} />
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