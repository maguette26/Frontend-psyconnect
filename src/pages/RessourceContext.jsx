    // src/pages/RessourceContext.jsx
    import React, { createContext, useState, useContext, useMemo } from 'react';

    // 1. Crée le Contexte
    const RessourceContext = createContext();

    // 2. Crée un Hook personnalisé pour utiliser le Contexte plus facilement
    export const useRessource = () => {
      const context = useContext(RessourceContext);
      if (!context) {
        throw new Error('useRessource doit être utilisé à l\'intérieur d\'un RessourceProvider');
      }
      return context;
    };

    // 3. Crée le Fournisseur (Provider) du Contexte
    export const RessourceProvider = ({ children }) => {
      // État de la catégorie sélectionnée, 'all' par défaut
      const [selectedCategory, setSelectedCategory] = useState('all');

      // Ordre et titres affichables pour les catégories
      const categoriesOrder = useMemo(() => ([
        { key: 'all', title: 'Toutes les catégories' },
        { key: 'citation', title: 'Citations Inspirantes' },
        { key: 'article', title: 'Articles Éducatifs' },
        { key: 'guide_pratique', title: 'Guides Pratiques' },
        { key: 'video', title: 'Vidéos de Relaxation et Exercices' },
        { key: 'podcast', title: 'Podcasts Bien-être' },
       // { key: 'outil', title: 'Outils Interactifs' },
   
        { key: 'Autres', title: 'Autres' } 
      ]), []);

      // Valeur fournie par le contexte
      const contextValue = useMemo(() => ({
        selectedCategory,
        setSelectedCategory,
        categoriesOrder
      }), [selectedCategory, categoriesOrder]);

      return (
        <RessourceContext.Provider value={contextValue}>
          {children}
        </RessourceContext.Provider>
      );
    };
    