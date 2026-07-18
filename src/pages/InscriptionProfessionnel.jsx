// src/pages/InscriptionProfessionnel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Stethoscope,
  UploadCloud, FileCheck2, X, HeartPulse, ArrowRight, CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/commun/Layout';
import AuthVisual from '../components/auth/AuthVisual';

const FIELD_ICONS = { nom: User, prenom: User, email: Mail, telephone: Phone };

const InputField = ({ id, label, type = 'text', autoComplete, value, onChange, error, isPassword, visible, onToggleVisible, icon: IconOverride }) => {
  const Icon = IconOverride || FIELD_ICONS[id] || User;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
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

const InscriptionProfessionnel = () => {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    specialite: '', motDePasse: '', confirmerMotDePasse: '', justificatif: null,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(9);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!submitted) return;
    if (countdown <= 0) { navigate('/'); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [submitted, countdown, navigate]);

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, justificatif: e.target.files[0] }));
    if (errors.justificatif) setErrors((prev) => ({ ...prev, justificatif: null }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, justificatif: file }));
      if (errors.justificatif) setErrors((prev) => ({ ...prev, justificatif: null }));
    }
  };

  const removeFile = () => setFormData((prev) => ({ ...prev, justificatif: null }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validatePassword = (password) => {
    const errs = [];
    if (password.length < 8) errs.push('Au moins 8 caractères.');
    if (!/[A-Z]/.test(password)) errs.push('Une majuscule.');
    if (!/[a-z]/.test(password)) errs.push('Une minuscule.');
    if (!/[0-9]/.test(password)) errs.push('Un chiffre.');
    if (!/[^A-Za-z0-9]/.test(password)) errs.push('Un caractère spécial.');
    return errs;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.nom.trim()) { newErrors.nom = 'Le nom est obligatoire.'; isValid = false; }
    if (!formData.prenom.trim()) { newErrors.prenom = 'Le prénom est obligatoire.'; isValid = false; }
    if (!formData.email.trim()) { newErrors.email = "L'adresse email est obligatoire."; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "L'adresse email n'est pas valide."; isValid = false; }
    if (!formData.telephone.trim()) { newErrors.telephone = 'Le numéro de téléphone est obligatoire.'; isValid = false; }
    else if (!/^\+?[0-9\s-]{8,}$/.test(formData.telephone)) { newErrors.telephone = 'Format invalide.'; isValid = false; }
    if (!formData.specialite.trim()) { newErrors.specialite = 'La spécialité est obligatoire.'; isValid = false; }
    if (!formData.justificatif) { newErrors.justificatif = 'Le justificatif est obligatoire.'; isValid = false; }
    const passwordErrors = validatePassword(formData.motDePasse);
    if (passwordErrors.length > 0) { newErrors.motDePasse = passwordErrors.join(' '); isValid = false; }
    if (formData.motDePasse !== formData.confirmerMotDePasse) { newErrors.confirmerMotDePasse = 'Les mots de passe ne correspondent pas.'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null) formPayload.append(key === 'justificatif' ? 'document' : key, val);
      });

      const response = await api.post('/professionnels/inscription', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('✅ Réponse backend:', response.data);
      setSubmitted(true);
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      console.error('❌ err.response:', err.response);

      const data = err.response?.data;
      let message = "Erreur lors de l'inscription. Veuillez réessayer.";
      if (typeof data === 'string') message = data;
      else if (data?.message) message = data.message;
      else if (data?.error) message = data.error;
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="pc-body flex min-h-screen bg-[#F8FAFC]">
          <AuthVisual
            title="Bienvenue sur PsyConnect"
            subtitle="Créez votre compte professionnel et accédez à vos fonctionnalités."
            showBenefits
          />
          <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-12">
            <div className="pc-card w-full max-w-[440px] bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(37,99,235,0.18)] p-10 text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="pc-display text-2xl font-bold text-slate-900 mb-3">Inscription réussie !</h2>
              <p className="text-slate-600 text-sm mb-2">
                Votre dossier a bien été reçu et est <span className="font-semibold text-amber-500">en cours de validation</span>.
              </p>
              <p className="text-slate-400 text-xs mb-8">
                Vous recevrez une confirmation par email une fois votre compte validé par notre équipe.
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${((9 - countdown) / 9) * 100}%` }}
                />
              </div>
              <p className="text-slate-400 text-xs mb-6">
                Redirection vers l'accueil dans <span className="font-semibold text-blue-500">{countdown}s</span>
              </p>
              <button onClick={() => navigate('/')} className="pc-btn w-full py-3 rounded-2xl text-white font-semibold text-sm">
                Aller à l'accueil maintenant
              </button>
            </div>
          </div>
        </div>
        <style>{`
          .pc-btn { background: linear-gradient(135deg, #2563EB, #1D4ED8); box-shadow: 0 10px 25px -8px rgba(37,99,235,0.55); transition: transform 0.2s ease; }
          .pc-btn:hover { transform: translateY(-2px); }
          .pc-card { animation: pc-card-in 0.6s ease both; }
          @keyframes pc-card-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pc-body flex min-h-screen bg-[#F8FAFC]">
        <AuthVisual
          title="Bienvenue sur PsyConnect"
          subtitle="Créez votre compte professionnel et accédez à vos fonctionnalités."
          showBenefits
        />

        <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-10">
          <div className="pc-card w-full max-w-[460px] bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(37,99,235,0.18)] p-9">

            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="pc-display text-lg font-bold text-slate-900">PsyConnect</span>
            </div>

            <h2 className="pc-display text-2xl font-bold text-slate-900 mb-1">Inscription professionnelle</h2>
            <p className="text-slate-500 text-sm mb-6">Rejoignez notre réseau de praticiens certifiés.</p>

            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
              {errors.general && (
                <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm text-center">
                  {errors.general}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <InputField id="nom" label="Nom" value={formData.nom} onChange={handleChange} error={errors.nom} autoComplete="family-name" />
                <InputField id="prenom" label="Prénom" value={formData.prenom} onChange={handleChange} error={errors.prenom} autoComplete="given-name" />
              </div>
              <InputField id="email" label="Email" type="email" value={formData.email} onChange={handleChange} error={errors.email} autoComplete="email" />
              <InputField id="telephone" label="Téléphone" type="tel" value={formData.telephone} onChange={handleChange} error={errors.telephone} autoComplete="tel" />

              {/* SPECIALITE */}
              <div>
                <label htmlFor="specialite" className="block text-xs font-semibold text-slate-700 mb-1.5">Spécialité</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    id="specialite"
                    name="specialite"
                    value={formData.specialite}
                    onChange={handleChange}
                    className={`pc-input w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border text-sm text-slate-900 appearance-none focus:outline-none focus:ring-4 transition
                      ${errors.specialite ? 'border-red-300 focus:ring-red-100' : 'border-transparent focus:border-blue-500 focus:ring-blue-100'}`}
                  >
                    <option value="">-- Choisir une spécialité --</option>
                    <option value="psychiatrie">Psychiatrie</option>
                    <option value="psychologie">Psychologie</option>
                  </select>
                </div>
                {errors.specialite && <p className="text-red-500 text-xs mt-1.5">{errors.specialite}</p>}
              </div>

              {/* JUSTIFICATIF - drag & drop */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Justificatif (PDF, JPG, PNG)
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('justificatif-input').click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-5 text-center transition
                    ${dragActive ? 'border-blue-500 bg-blue-50' : errors.justificatif ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-slate-50 hover:border-blue-300'}`}
                >
                  <input
                    id="justificatif-input"
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {formData.justificatif ? (
                    <div className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2 border border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs text-slate-700 truncate">{formData.justificatif.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                        className="text-slate-400 hover:text-red-500"
                        aria-label="Retirer le fichier"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-600">
                        Glissez votre fichier ici ou <span className="text-blue-600 font-semibold">parcourir</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">PDF, JPG ou PNG</p>
                    </>
                  )}
                </div>
                {errors.justificatif && <p className="text-red-500 text-xs mt-1.5">{errors.justificatif}</p>}
              </div>

              <InputField
                id="motDePasse" label="Mot de passe" value={formData.motDePasse}
                onChange={handleChange} error={errors.motDePasse} autoComplete="new-password"
                isPassword visible={showPassword} onToggleVisible={() => setShowPassword((s) => !s)}
              />
              <InputField
                id="confirmerMotDePasse" label="Confirmer le mot de passe" value={formData.confirmerMotDePasse}
                onChange={handleChange} error={errors.confirmerMotDePasse} autoComplete="new-password"
                isPassword visible={showConfirm} onToggleVisible={() => setShowConfirm((s) => !s)}
              />

              <button
                type="submit"
                disabled={loading}
                className="pc-btn w-full py-3.5 mt-1 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Envoi du dossier...' : (<>Créer mon compte <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>

            <p className="mt-6 text-center text-slate-500 text-sm">
              Vous avez déjà un compte ?{' '}
              <Link to="/connexion" className="font-semibold text-blue-600 hover:underline">Connectez-vous ici</Link>
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

export default InscriptionProfessionnel;