// src/pages/InscriptionUser.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, HeartPulse, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { login } from '../services/serviceAuth';
import Layout from '../components/commun/Layout';
import AuthVisual from '../components/auth/AuthVisual';

const FIELD_ICONS = {
  nom: User,
  prenom: User,
  email: Mail,
  telephone: Phone,
  motDePasse: Lock,
  confirmerMotDePasse: Lock,
};

const InputField = ({ id, label, type = 'text', autoComplete, value, onChange, error, isPassword, visible, onToggleVisible }) => {
  const Icon = FIELD_ICONS[id] || User;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id={id}
          name={id}
          type={isPassword ? (visible ? 'text' : 'password') : type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={label}
          className={`pc-input w-full pl-10 ${isPassword ? 'pr-10' : 'pr-4'} py-3 rounded-2xl bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition
            ${error ? 'border-red-300 focus:ring-red-100' : 'border-transparent focus:border-blue-500 focus:ring-blue-100'}`}
        />
        {isPassword && (
  <button
    type="button"
    onClick={onToggleVisible}
    tabIndex={-1}
    aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 !bg-transparent !border-0 !shadow-none p-0 m-0 text-slate-400 hover:text-slate-600 transition-colors"
  >
    {visible ? (
      <EyeOff className="w-5 h-5" />
    ) : (
      <Eye className="w-5 h-5" />
    )}
  </button>
)}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
};

const InscriptionUser = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmerMotDePasse: '',
    telephone: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Le mot de passe doit contenir au moins 8 caractères.');
    if (!/[A-Z]/.test(password)) errors.push('Le mot de passe doit contenir au moins une lettre majuscule.');
    if (!/[a-z]/.test(password)) errors.push('Le mot de passe doit contenir au moins une lettre minuscule.');
    if (!/[0-9]/.test(password)) errors.push('Le mot de passe doit contenir au moins un chiffre.');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Le mot de passe doit contenir au moins un caractère spécial.');
    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire.';
      isValid = false;
    }
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire.';
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est obligatoire.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'adresse email n'est pas valide.";
      isValid = false;
    }
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est obligatoire.';
      isValid = false;
    } else if (!/^\+?[0-9\s-]{8,}$/.test(formData.telephone)) {
      newErrors.telephone = "Le format du numéro de téléphone n'est pas valide.";
      isValid = false;
    }
    const passwordErrors = validatePassword(formData.motDePasse);
    if (passwordErrors.length > 0) {
      newErrors.motDePasse = passwordErrors.join(' ');
      isValid = false;
    }
    if (formData.motDePasse !== formData.confirmerMotDePasse) {
      newErrors.confirmerMotDePasse = 'Les mots de passe ne correspondent pas.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSubmit = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        motDePasse: formData.motDePasse,
        confirmMotDePasse: formData.confirmerMotDePasse,
        telephone: formData.telephone,
      };

      await api.post('/auth/register', dataToSubmit);

      const responseData = await login(formData.email, formData.motDePasse);

      const { role } = responseData;
      const cleanedRole = role.replace('ROLE_', '');
      const roleToStore = cleanedRole === 'USER' ? 'UTILISATEUR' : cleanedRole;

      localStorage.setItem('role', roleToStore);

      setSuccess('Inscription réussie ! Redirection en cours...');

      switch (cleanedRole) {
        case 'ADMIN':
          navigate('/tableauAdmin');
          break;
        case 'PSYCHIATRE':
        case 'PSYCHOLOGUE':
        case 'USER':
          navigate('/');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error("Erreur d'inscription:", err.response?.data || err.message);
      const backendData = err.response?.data;

      if (backendData?.errors) {
        const errorMessages = backendData.errors.map((e) => e.defaultMessage || e.message).join(' ');
        setErrors((prev) => ({ ...prev, general: errorMessages }));
      } else if (backendData?.message) {
        setErrors((prev) => ({ ...prev, general: backendData.message }));
      } else if (typeof backendData === 'string') {
        setErrors((prev) => ({ ...prev, general: backendData }));
      } else {
        setErrors((prev) => ({ ...prev, general: "Erreur lors de l'inscription. Veuillez réessayer." }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="pc-body flex min-h-screen bg-[#F8FAFC]">
        <AuthVisual
          title="Bienvenue sur PsyConnect"
          subtitle="Votre espace sécurisé dédié au bien-être mental."
          showBenefits
        />

        {/* RIGHT SIDE */}
        <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-12">
          <div className="pc-card w-full max-w-[460px] bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(37,99,235,0.18)] p-10">

            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="pc-display text-lg font-bold text-slate-900">PsyConnect</span>
            </div>

            <h2 className="pc-display text-[1.75rem] font-bold text-slate-900 mb-1">Créer un compte</h2>
            <p className="text-slate-500 text-sm mb-7">Rejoignez notre plateforme en quelques secondes.</p>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {errors.general && (
                <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm text-center">
                  {errors.general}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl text-sm text-center">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <InputField id="nom" label="Nom" value={formData.nom} onChange={handleChange} error={errors.nom} autoComplete="family-name" />
                <InputField id="prenom" label="Prénom" value={formData.prenom} onChange={handleChange} error={errors.prenom} autoComplete="given-name" />
              </div>

              <InputField id="email" label="Adresse email" type="email" value={formData.email} onChange={handleChange} error={errors.email} autoComplete="email" />
              <InputField id="telephone" label="Téléphone" type="tel" value={formData.telephone} onChange={handleChange} error={errors.telephone} autoComplete="tel" />
              <InputField
                id="motDePasse"
                label="Mot de passe"
                value={formData.motDePasse}
                onChange={handleChange}
                error={errors.motDePasse}
                autoComplete="new-password"
                isPassword
                visible={showPassword}
                onToggleVisible={() => setShowPassword((s) => !s)}
              />
              <InputField
                id="confirmerMotDePasse"
                label="Confirmer le mot de passe"
                value={formData.confirmerMotDePasse}
                onChange={handleChange}
                error={errors.confirmerMotDePasse}
                autoComplete="new-password"
                isPassword
                visible={showConfirm}
                onToggleVisible={() => setShowConfirm((s) => !s)}
              />

              <button
                type="submit"
                disabled={loading}
                className="pc-btn w-full py-3.5 mt-2 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Création du compte...' : (<>Créer mon compte <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Vous avez déjà un compte ?{' '}
              <Link to="/connexion" className="font-semibold text-blue-600 hover:underline">
                Connectez-vous ici
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .pc-btn {
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          box-shadow: 0 10px 25px -8px rgba(37,99,235,0.55);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pc-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px -8px rgba(37,99,235,0.65);
        }
        .pc-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -60%;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .pc-btn:hover::after { left: 130%; }
        .pc-card { animation: pc-card-in 0.6s ease both; }
        @keyframes pc-card-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pc-card { animation: none; }
          .pc-btn:hover:not(:disabled) { transform: none; }
        }
      `}</style>
    </Layout>
  );
};

export default InscriptionUser;