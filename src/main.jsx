// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // <-- Assurez-vous que l'importation est comme ceci
import './index.css'; // Si vous utilisez un fichier CSS global
import '@fortawesome/fontawesome-free/css/all.min.css';

import { Buffer } from "buffer";
import process from "process";
window.global = window;
window.Buffer = Buffer;
window.process = process;
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  
);
