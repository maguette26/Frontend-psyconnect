// src/components/auth/AuthVisual.jsx
import React, { useEffect, useState } from 'react';
import { Heart, Brain, ShieldCheck, MessageCircle, CheckCircle2 } from 'lucide-react';

const DEFAULT_BENEFITS = [
  'Confidentialité garantie',
  'Professionnels certifiés',
  'Assistance disponible 24h/24',
];

/**
 * Left-hand illustrated panel shared across Connexion / Inscription pages.
 * Signature element: two "breathing" rings connected by a dialogue line —
 * an abstract, calm visualisation of a therapist/patient conversation.
 */
const AuthVisual = ({
  title = 'Bienvenue sur PsyConnect',
  subtitle = 'Votre espace sécurisé dédié au bien-être mental.',
  showBenefits = false,
  benefits = DEFAULT_BENEFITS,
}) => {
  const [drift, setDrift] = useState({ a: 0, b: 0, c: 0 });

  useEffect(() => {
    let frame;
    const animate = () => {
      const t = Date.now() / 1000;
      setDrift({
        a: 14 * Math.sin(t / 2.2),
        b: 18 * Math.cos(t / 2.8),
        c: 10 * Math.sin(t / 1.6),
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="pc-visual hidden md:flex w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-[#EAF4FF] to-[#D8E9FF]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .pc-display { font-family: 'Sora', system-ui, sans-serif; }
        .pc-body { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes pc-breathe {
          0%, 100% { transform: scale(0.94); opacity: 0.55; }
          50% { transform: scale(1.06); opacity: 0.9; }
        }
        @keyframes pc-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pc-dash { to { stroke-dashoffset: -40; } }

        .pc-ring { animation: pc-breathe 7s ease-in-out infinite; transform-origin: center; }
        .pc-ring-delay { animation-delay: 1.2s; }
        .pc-icon-float { animation: pc-float 5.5s ease-in-out infinite; }
        .pc-dialogue-line { stroke-dasharray: 6 8; animation: pc-dash 3s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .pc-ring, .pc-icon-float, .pc-dialogue-line { animation: none !important; }
        }
      `}</style>

      {/* organic background shapes */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <circle cx={150 + drift.a} cy={140 + drift.b} r="140" fill="#BFDBFE" opacity="0.45" />
        <circle cx={660 + drift.b} cy={460 + drift.c} r="170" fill="#93C5FD" opacity="0.4" />
        <circle cx={430 + drift.c} cy={310 + drift.a} r="200" fill="#60A5FA" opacity="0.22" />
        <path
          d="M0,420 C160,470 260,360 420,410 C580,460 680,380 800,430 L800,600 L0,600 Z"
          fill="#DBEAFE"
          opacity="0.55"
        />
      </svg>

      {/* discreet floating icons */}
      <Heart className="pc-icon-float absolute top-[18%] left-[20%] w-5 h-5 text-blue-400/40" />
      <Brain className="pc-icon-float absolute top-[65%] left-[16%] w-6 h-6 text-blue-500/30" style={{ animationDelay: '1.5s' }} />
      <ShieldCheck className="pc-icon-float absolute top-[24%] right-[16%] w-5 h-5 text-blue-500/30" style={{ animationDelay: '0.8s' }} />
      <MessageCircle className="pc-icon-float absolute top-[70%] right-[20%] w-5 h-5 text-blue-400/40" style={{ animationDelay: '2.2s' }} />

      <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-md pc-body">
        {/* signature illustration: breathing dialogue */}
        <svg width="220" height="150" viewBox="0 0 220 150" className="mb-8" aria-hidden="true">
          <circle className="pc-ring" cx="60" cy="75" r="42" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
          <circle className="pc-ring pc-ring-delay" cx="160" cy="75" r="34" fill="none" stroke="#2563EB" strokeWidth="1.5" />
          <circle cx="60" cy="75" r="26" fill="#2563EB" />
          <circle cx="160" cy="75" r="20" fill="#60A5FA" />
          <path
            className="pc-dialogue-line"
            d="M88,72 C110,50 130,50 150,68"
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <h1 className="pc-display text-[2.1rem] leading-tight font-bold text-slate-900 mb-3">
          {title}
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">{subtitle}</p>

        {showBenefits && (
          <ul className="mt-8 space-y-3 text-left">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AuthVisual;