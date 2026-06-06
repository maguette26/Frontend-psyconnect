// src/pages/InscriptionProfessionnel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/commun/Layout';

const InputField = ({ id, label, type = 'text', autoComplete, value, onChange, error, placeholder }) => (
  <div className="flex flex-col mb-3">
    <label htmlFor={id} className="mb-1 text-gray-800 font-semibold text-xs">{label}</label>
    <input
      id={id}
      name={id}
      type={type}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      placeholder={placeholder || label}
      className={`border rounded-md px-2 py-1 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition
        ${error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
    />
    {error && <p className="text-red-600 text-[10px] mt-1 italic font-medium">{error}</p>}
  </div>
);

const InscriptionProfessionnel = () => {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    specialite: '', motDePasse: '', confirmerMotDePasse: '', justificatif: null,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false); // ✅ nouvel état
  const [countdown, setCountdown] = useState(9);     // ✅ compte à rebours
  const navigate = useNavigate();

  const [offsets, setOffsets] = useState({ circle1: {x:0,y:0}, circle2: {x:0,y:0}, circle3: {x:0,y:0} });
  useEffect(() => {
    let frame;
    const animate = () => {
      const time = Date.now() / 1000;
      setOffsets({
        circle1: { x: 15 * Math.sin(time), y: 10 * Math.cos(time/1.5) },
        circle2: { x: 20 * Math.cos(time/1.2), y: 15 * Math.sin(time/2) },
        circle3: { x: 10 * Math.sin(time/1.8), y: 12 * Math.cos(time/1.3) },
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  // ✅ Compte à rebours uniquement après soumission réussie
  useEffect(() => {
    if (!submitted) return;
    if (countdown <= 0) { navigate('/'); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [submitted, countdown, navigate]);

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, justificatif: e.target.files[0] }));
    if (errors.justificatif) setErrors(prev => ({ ...prev, justificatif: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validatePassword = (password) => {
    const errs = [];
    if (password.length < 8) errs.push("Au moins 8 caractères.");
    if (!/[A-Z]/.test(password)) errs.push("Une majuscule.");
    if (!/[a-z]/.test(password)) errs.push("Une minuscule.");
    if (!/[0-9]/.test(password)) errs.push("Un chiffre.");
    if (!/[^A-Za-z0-9]/.test(password)) errs.push("Un caractère spécial.");
    return errs;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.nom.trim()) { newErrors.nom = "Le nom est obligatoire."; isValid=false; }
    if (!formData.prenom.trim()) { newErrors.prenom = "Le prénom est obligatoire."; isValid=false; }
    if (!formData.email.trim()) { newErrors.email = "L'adresse email est obligatoire."; isValid=false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "L'adresse email n'est pas valide."; isValid=false; }
    if (!formData.telephone.trim()) { newErrors.telephone = "Le numéro de téléphone est obligatoire."; isValid=false; }
    else if (!/^\+?[0-9\s-]{8,}$/.test(formData.telephone)) { newErrors.telephone = "Format invalide."; isValid=false; }
    if (!formData.specialite.trim()) { newErrors.specialite = "La spécialité est obligatoire."; isValid=false; }
    if (!formData.justificatif) { newErrors.justificatif = "Le justificatif est obligatoire."; isValid=false; }
    const passwordErrors = validatePassword(formData.motDePasse);
    if (passwordErrors.length > 0) { newErrors.motDePasse = passwordErrors.join(" "); isValid=false; }
    if (formData.motDePasse !== formData.confirmerMotDePasse) { newErrors.confirmerMotDePasse = "Les mots de passe ne correspondent pas."; isValid=false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null) formPayload.append(key === 'justificatif' ? 'document' : key, val);
      });
      await api.post('/professionnels/inscription', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(true); // ✅ affiche l'écran de succès
    } catch (err) {
      const data = err.response?.data;
      let message = "Erreur lors de l'inscription. Veuillez réessayer.";
      if (typeof data === "string") message = data;
      else if (data?.message) message = data.message;
      else if (data?.error) message = data.error;
      setErrors(prev => ({ ...prev, general: message }));
    }
  };

  const AnimatedBg = () => (
    <div className="hidden md:flex w-1/2 items-center justify-center rounded-l-3xl overflow-hidden relative bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-300">
      <svg className="absolute w-full h-full" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <circle cx={200 + offsets.circle1.x} cy={200 + offsets.circle1.y} r="120" fill="#93c5fd" />
        <circle cx={600 + offsets.circle2.x} cy={400 + offsets.circle2.y} r="150" fill="#60a5fa" />
        <circle cx={400 + offsets.circle3.x} cy={300 + offsets.circle3.y} r="180" fill="#3b82f6" />
      </svg>
      <div className="relative z-10 text-center p-10 max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Bienvenue sur PsyConnect</h1>
        <p className="text-gray-700 text-lg">Créez votre compte professionnel et accédez à vos fonctionnalités.</p>
      </div>
    </div>
  );

  // ✅ Écran de succès complet — remplace le formulaire
  if (submitted) {
    return (
      <Layout>
        <div className="flex min-h-screen bg-gray-50">
          <AnimatedBg />
          <div className="flex w-full md:w-1/2 items-center justify-center p-10">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 text-center">
              {/* Icône succès */}
              <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">Inscription réussie !</h2>

              <p className="text-gray-600 text-sm mb-2">
                Votre dossier a bien été reçu et est <span className="font-semibold text-yellow-600">en cours de validation</span>.
              </p>
              <p className="text-gray-500 text-xs mb-8">
                Vous recevrez une confirmation par email une fois votre compte validé par notre équipe.
              </p>

              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${((9 - countdown) / 9) * 100}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mb-6">
                Redirection vers l'accueil dans <span className="font-semibold text-blue-500">{countdown}s</span>
              </p>

              <button
                onClick={() => navigate('/')}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition duration-300"
              >
                Aller à l'accueil maintenant
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Formulaire normal
  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50">
        <AnimatedBg />
        <div className="flex w-full md:w-1/2 items-center justify-center p-10">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Inscription</h2>

            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
              {errors.general && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-2 rounded-md text-center text-sm mb-4">
                  {errors.general}
                </div>
              )}

              <InputField id="nom" label="Nom" value={formData.nom} onChange={handleChange} error={errors.nom} autoComplete="family-name" />
              <InputField id="prenom" label="Prénom" value={formData.prenom} onChange={handleChange} error={errors.prenom} autoComplete="given-name" />
              <InputField id="email" label="Email" type="email" value={formData.email} onChange={handleChange} error={errors.email} autoComplete="email" />
              <InputField id="telephone" label="Téléphone" type="tel" value={formData.telephone} onChange={handleChange} error={errors.telephone} autoComplete="tel" />
              <InputField id="specialite" label="Spécialité" value={formData.specialite} onChange={handleChange} error={errors.specialite} placeholder="Ex: psychiatrie, psychologie" />

              <div className="flex flex-col mb-3">
                <label htmlFor="justificatif" className="mb-1 text-gray-800 font-semibold text-xs">Justificatif (PDF, JPG, PNG)</label>
                <input
                  type="file" id="justificatif" accept=".pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className={`border rounded-md px-2 py-1 text-gray-900 text-sm focus:outline-none focus:ring-2 transition
                    ${errors.justificatif ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                />
                {errors.justificatif && <p className="text-red-600 text-[10px] mt-1 italic font-medium">{errors.justificatif}</p>}
              </div>

              <InputField id="motDePasse" label="Mot de passe" type="password" value={formData.motDePasse} onChange={handleChange} error={errors.motDePasse} autoComplete="new-password" />
              <InputField id="confirmerMotDePasse" label="Confirmer le mot de passe" type="password" value={formData.confirmerMotDePasse} onChange={handleChange} error={errors.confirmerMotDePasse} autoComplete="new-password" />

              <div className="flex justify-center">
                <button type="submit" className="w-40 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition duration-300 ease-in-out">
                  S'inscrire
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-gray-700 text-xs">
              Vous avez déjà un compte ?{' '}
              <Link to="/connexion" className="font-semibold text-blue-600 hover:underline">Connectez-vous ici</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InscriptionProfessionnel;