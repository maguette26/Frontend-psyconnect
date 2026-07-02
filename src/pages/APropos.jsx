import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, ShieldCheck, Briefcase } from 'lucide-react';
import Header from '../components/commun/header';
import PiedPage from '../components/commun/PiedPage';

const sections = [
  {
    icon: Heart,
    titre: "Pourquoi PsyConnect existe",
    texte: "Dans notre société moderne, la santé mentale est encore trop souvent négligée, mal comprise ou stigmatisée. De nombreuses personnes souffrent en silence, sans savoir vers qui se tourner, par peur du jugement ou faute de moyens adaptés. C'est à partir de ce constat que PsyConnect est né.",
  },
  {
    icon: ShieldCheck,
    titre: "Notre mission",
    texte: "PsyConnect est bien plus qu'une simple plateforme. C'est un espace sécurisé, confidentiel et bienveillant, conçu pour connecter les utilisateurs avec des professionnels de santé mentale qualifiés (psychologues, psychiatres). Notre objectif : rendre l'accompagnement psychologique accessible à tous, peu importe l'endroit où l'on se trouve ou la situation dans laquelle on est.",
  },
  {
    icon: Users,
    titre: "Un espace d'expression libre",
    texte: "Nous offrons également une zone d'expression personnelle et libre. Un forum confidentiel est mis à disposition pour permettre aux utilisateurs d'échanger, de raconter ce qu'ils ressentent, ou simplement d'écrire ce qu'ils n'osent pas dire ailleurs. C'est un endroit où les mots peuvent enfin sortir, sans peur, sans jugement.",
  },
  {
    icon: Briefcase,
    titre: "Pour les professionnels de santé mentale",
    texte: "PsyConnect est une opportunité d'élargir leur portée, de gérer leurs disponibilités facilement et d'entrer en contact avec des patients dans un cadre sécurisé et fluide. Toutes les réservations de consultations se font en quelques clics, avec un système de notifications et de suivi en temps réel.",
  },
];

const APropos = () => {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            Notre histoire
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4">
            À propos de PsyConnect
          </h1>
          <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto" />
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.titre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm p-7 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" strokeWidth={1.8} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    {section.titre}
                  </h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-base">
                  {section.texte}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 text-center bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 sm:p-10 shadow-lg shadow-blue-600/20"
        >
          <p className="text-white text-lg sm:text-xl font-semibold leading-relaxed max-w-2xl mx-auto">
            La santé mentale n'est pas un luxe, elle est essentielle. Chez PsyConnect, nous croyons fermement que chaque individu mérite d'être écouté, soutenu et accompagné.
          </p>
          <p className="text-blue-100 text-sm sm:text-base mt-4 max-w-xl mx-auto">
            Rejoignez-nous dans cette mission humaine. Ensemble, brisons les tabous, construisons un monde plus à l'écoute, et faisons de la santé mentale une priorité pour tous.
          </p>
        </motion.div>
      </main>
      <PiedPage />
    </>
  );
};

export default APropos;