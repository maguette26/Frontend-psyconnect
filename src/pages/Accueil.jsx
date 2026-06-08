import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import Layout from '../components/commun/Layout';
import Hero from '../components/commun/Hero';
import Fonctionnalites from '../components/commun/Fonctionnalites';
import PourquoiNous from '../components/commun/PourquoiNous';

const Accueil = () => {
  const containerRef = useRef(null);
  const sectionsCount = 3;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % sectionsCount;
        if (containerRef.current) {
          containerRef.current.children[nextIndex]?.scrollIntoView({
            behavior: 'smooth',
          });
        }
        return nextIndex;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [autoScroll]);

  return (
    <Layout noPadding>
      <button
        onClick={() => setAutoScroll(!autoScroll)}
        aria-label={autoScroll ? 'Pause auto scroll' : 'Play auto scroll'}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center
          w-10 h-10 md:w-12 md:h-12 rounded-full
          bg-indigo-400 text-white shadow-lg
          hover:bg-indigo-600 transition
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          active:scale-90"
      >
        {autoScroll ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      <div
        ref={containerRef}
        className="overflow-y-scroll scroll-smooth snap-y snap-mandatory"
        style={{ height: '100dvh' }}
      >
        <section
          className="snap-start flex items-center justify-center bg-indigo-50 px-4"
          style={{ minHeight: '100dvh' }}
        >
          <Hero />
        </section>

        <section
          className="snap-start flex items-center justify-center bg-white dark:bg-gray-900 px-4"
          style={{ minHeight: '100dvh' }}
        >
          <Fonctionnalites />
        </section>

        <section
          className="snap-start flex items-center justify-center bg-white dark:bg-gray-900 px-4"
          style={{ minHeight: '100dvh' }}
        >
          <PourquoiNous />
        </section>
      </div>
    </Layout>
  );
};

export default Accueil;