// 📄 src/pages/GuideFixateurLimites.jsx
import React from 'react';
import Layout from '../components/commun/Layout';
import {
  ShieldCheck,
  MessageSquare,
  Slash,
  UserCheck,
  RefreshCcw,
  Heart,
  ChevronLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GuideFixateurLimites = () => {
  const navigate = useNavigate();

  const conseils = [
    {
      icon: ShieldCheck,
      title: 'Identifier ses limites',
      description: 'Savoir ce qui vous met mal à l’aise ou vous fatigue.',
    },
    {
      icon: MessageSquare,
      title: 'Communiquer clairement',
      description: 'Exprimer ses besoins simplement et calmement.',
    },
    {
      icon: Slash,
      title: 'Dire non',
      description: 'Refuser sans culpabiliser pour se protéger.',
    },
    {
      icon: UserCheck,
      title: 'Se respecter',
      description: 'Vos besoins sont importants.',
    },
    {
      icon: RefreshCcw,
      title: 'Réajuster',
      description: 'Vos limites évoluent avec le temps.',
    },
  ];

  return (
    <Layout>
      <div className="max-w-md md:max-w-3xl mx-auto px-3 md:px-6 py-4">

        {/* 🔙 BACK BUTTON */}
        <button
          onClick={() => navigate('/ressources')}
          className="flex items-center gap-1 text-indigo-600 text-xs md:text-sm mb-3 hover:text-indigo-800 transition"
        >
          <ChevronLeft size={16} />
          Retour aux ressources
        </button>

        {/* HERO */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 text-center mb-4">
          <div className="flex justify-center mb-2">
            <div className="bg-indigo-100 p-2 rounded-full">
              <ShieldCheck className="w-5 md:w-6 h-5 md:h-6 text-indigo-600" />
            </div>
          </div>

          <h1 className="text-lg md:text-2xl font-bold text-indigo-700 mb-1">
            Fixer des Limites
          </h1>

          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Protéger sa santé mentale et améliorer ses relations.
          </p>
        </div>

        {/* POURQUOI */}
        <div className="bg-indigo-600 text-white rounded-xl p-3 md:p-5 mb-4">
          <h2 className="text-sm md:text-base font-semibold mb-1">
            Pourquoi c’est important ?
          </h2>

          <p className="text-[11px] md:text-sm text-indigo-100 leading-snug">
            Les limites protègent votre énergie, réduisent le stress et
            améliorent vos relations personnelles et professionnelles.
          </p>
        </div>

        {/* CONSEILS */}
        <div className="space-y-2">
          {conseils.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="bg-white border border-indigo-100 rounded-lg p-3 md:p-4 flex gap-2 shadow-sm hover:shadow-md transition"
              >
                <div className="bg-indigo-100 p-1.5 md:p-2 rounded-md h-fit">
                  <Icon className="w-4 md:w-5 h-4 md:h-5 text-indigo-600" />
                </div>

                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-[11px] md:text-sm text-gray-600 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* EXEMPLE */}
        <div className="mt-4 bg-white rounded-xl p-3 md:p-5 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold text-indigo-700 mb-2">
            Exemple concret
          </h2>

          <p className="text-[11px] md:text-sm text-gray-600 italic leading-snug">
            « Merci, mais je ne peux pas cette semaine. J’ai besoin de temps
            pour moi. »
          </p>
        </div>

        {/* CITATION */}
        <div className="mt-4 text-center">
          <Heart className="w-4 md:w-5 h-4 md:h-5 mx-auto text-indigo-500 mb-1" />
          <p className="text-[11px] md:text-sm text-gray-600 italic">
            Poser des limites, c’est se respecter.
          </p>
        </div>

      </div>
    </Layout>
  );
};

export default GuideFixateurLimites;