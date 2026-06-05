// src/pages/ListeControleBienEtre.jsx
import React, { useState } from 'react';
import Layout from '../components/commun/Layout';

const ListeControleBienEtre = () => {
  const [checks, setChecks] = useState({
    sommeil: false,
    alimentation: false,
    exercice: false,
    hydratation: false,
    relaxation: false,
  });

  const toggleCheck = (key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Liste de Contrôle Bien-Être</h1>
        <p>Cochez les actions que vous avez réalisées aujourd'hui :</p>
        <ul className="mt-4 space-y-3">
          {Object.entries(checks).map(([key, checked]) => (
            <li key={key}>
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCheck(key)}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                <span className="ml-3 capitalize">{key === 'sommeil' ? 'Sommeil suffisant' :
                  key === 'alimentation' ? 'Alimentation équilibrée' :
                  key === 'exercice' ? 'Exercice physique' :
                  key === 'hydratation' ? 'Hydratation suffisante' :
                  'Relaxation/Temps pour soi'}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-semibold">
          Total actions réalisées : {Object.values(checks).filter(Boolean).length} / {Object.keys(checks).length}
        </p>
      </div>
    </Layout>
  );
};

export default ListeControleBienEtre;
