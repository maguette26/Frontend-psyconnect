import React, { useState, useEffect } from 'react';
 
import PiedPage from './PiedPage';
import Header from './header';

const Layout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Lire depuis localStorage si dispo
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-grow px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <PiedPage />
    </div>
  );
};

export default Layout;
