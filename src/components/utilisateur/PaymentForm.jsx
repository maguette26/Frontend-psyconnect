import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import api from '../../services/api';

const stripePromise = loadStripe("pk_test_51RXnftAc9vHWOsmYRgXSBdNEne7MxfObedkDBDRtA7l5G2zZM0sfMPfhHmCtWqeNIM81YSEyREpIPVDg76hE201t002UNapsv0");

/* ─── POLLING STATUT ─────────────────────────────────────────────── */
async function pollReservationStatus(reservationId, targetStatut, timeoutMs = 30000) {
  const interval = 2000;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const { data } = await api.get(`/reservations/${reservationId}`);
      if (data?.statut === targetStatut) return data;
    } catch (_) {}
    await new Promise(r => setTimeout(r, interval));
  }
  return null;
}

/* ─── PHASES UI ──────────────────────────────────────────────────── */
// idle | processing | polling | success | error
function PhaseIndicator({ phase, errorMsg }) {
  if (phase === 'idle') return null;

  const configs = {
    processing: { icon: <Loader2 size={15} className="animate-spin" />,   text: 'Paiement en cours de traitement…',    cls: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    polling:    { icon: <Loader2 size={15} className="animate-spin" />,   text: 'Synchronisation avec le serveur…',    cls: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
   success: { 
  icon: <CheckCircle2 size={15} />, 
  text: 'Paiement effectué. Mise à jour de votre réservation en cours...', 
  cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' 
},
    error:      { icon: <AlertCircle size={15} />,                         text: errorMsg || 'Une erreur est survenue.', cls: 'bg-red-50 border-red-200 text-red-600' },
  };

  const c = configs[phase];
  if (!c) return null;

  return (
    <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 border text-sm font-medium ${c.cls}`}>
      {c.icon}
      <span>{c.text}</span>
    </div>
  );
}

/* ─── BARRE DE PROGRESSION ───────────────────────────────────────── */
function ProgressBar({ phase }) {
  const widths = { idle: '0%', processing: '65%', polling: '85%', success: '100%', error: '100%' };
  const colors = { success: 'bg-emerald-400', error: 'bg-red-400' };
  const color  = colors[phase] || 'bg-indigo-500';
  const width  = widths[phase] || '0%';

  if (phase === 'idle') return null;

  return (
    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width }}
      />
    </div>
  );
}

/* ─── CHECKOUT FORM (Stripe) ─────────────────────────────────────── */
const CheckoutForm = ({ clientSecret, reservationId, onPhaseChange, onPaid }) => {
  const stripe   = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    onPhaseChange('processing');

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        onPhaseChange('error', result.error.message);
        return;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        onPhaseChange('polling');

        const updated = await pollReservationStatus(reservationId, 'PAYEE', 30000);

        onPhaseChange('success');
        // Petit délai pour que l'utilisateur voit le succès avant fermeture
        setTimeout(() => onPaid?.(), 1500);
        return;
      }

      onPhaseChange('error', 'Paiement non abouti, veuillez réessayer.');
    } catch (err) {
      onPhaseChange('error', err.message || 'Erreur inconnue.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white transition">
        <CardElement options={{
          style: {
            base: {
              fontSize: '15px',
              color: '#1e293b',
              fontFamily: 'DM Sans, system-ui, sans-serif',
              '::placeholder': { color: '#94a3b8' },
            },
            invalid: { color: '#ef4444' },
          }
        }} />
      </div>

      <button
        type="submit"
        disabled={!stripe}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
      >
        <CreditCard size={16} />
        Payer maintenant
      </button>
    </form>
  );
};

/* ─── PAYMENT FORM (principal) ───────────────────────────────────── */
const PaymentForm = ({ reservationId, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [clientSecret, setClientSecret]   = useState(null);
  const [phase, setPhase]                 = useState('idle'); // idle | processing | polling | success | error
  const [errorMsg, setErrorMsg]           = useState('');

  const handlePhaseChange = useCallback((p, msg = '') => {
    setPhase(p);
    if (msg) setErrorMsg(msg);
  }, []);

  const createPayment = useCallback(() =>
    api.post('/payments/create', {
      reservationId,
      paymentMethod,
      successUrl: window.location.origin + '/payment-success',
      cancelUrl:  window.location.origin + '/payment-cancel',
      currency: 'EUR',
    }, { timeout: 15000 }).then(r => r.data)
  , [reservationId, paymentMethod]);

  /* ── Init Stripe ── */
  useEffect(() => {
    if (paymentMethod !== 'stripe') return;
    let cancelled = false;

    setClientSecret(null);
    setErrorMsg('');

    createPayment()
      .then(data => {
        if (cancelled) return;
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
          setPhase('idle');
        } else {
          handlePhaseChange('error', "Impossible d'initialiser le paiement.");
        }
      })
      .catch(err => {
        if (cancelled) return;
        const msg = err?.response?.data?.message || 'Serveur indisponible. Réessayez dans quelques secondes.';
        handlePhaseChange('error', msg);
      });

    return () => { cancelled = true; };
  }, [paymentMethod, createPayment, handlePhaseChange]);

  /* ── PayPal ── */
  const handlePayPalPayment = async () => {
    setErrorMsg('');

    try {
      const data = await createPayment();
      if (data?.approvalUrl) {
        setPhase('processing');
        window.location.href = data.approvalUrl;
      } else {
        handlePhaseChange('error', 'Erreur PayPal, veuillez réessayer.');
      }
    } catch {
      handlePhaseChange('error', 'Erreur PayPal, veuillez réessayer.');
    }
  };

  const isLocked = ['processing', 'polling'].includes(phase);
  const isDone   = phase === 'success';

  return (
    <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl overflow-hidden">

      {/* Barre de progression en haut */}
      <ProgressBar phase={phase} />

      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Paiement sécurisé</h2>
          <button
            onClick={onClose}
            disabled={isLocked}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-30"
          >
            ×
          </button>
        </div>

        {/* Switch méthode — désactivé pendant une action */}
        <div className="flex gap-2">
          {['stripe', 'paypal'].map(m => (
            <button
              key={m}
              onClick={() => { if (!isLocked && !isDone) { setPaymentMethod(m); setPhase('idle'); setErrorMsg(''); } }}
              disabled={isLocked || isDone}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
                paymentMethod === m
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              } disabled:opacity-50`}
            >
              {m === 'stripe' ? '💳 Carte bancaire' : '🅿️ PayPal'}
            </button>
          ))}
        </div>

        {/* Indicateur de phase */}
        <PhaseIndicator phase={phase} errorMsg={errorMsg} />

        {/* Stripe */}
        {paymentMethod === 'stripe' && !isDone && (
          <>
            {/* Skeleton pendant init */}
            {!clientSecret && !['error'].includes(phase) && (
              <div className="space-y-3 animate-pulse">
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-12 bg-slate-100 rounded-xl" />
              </div>
            )}

            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  reservationId={reservationId}
                  onPhaseChange={handlePhaseChange}
                  onPaid={() => onPaymentSuccess?.()}
                />
              </Elements>
            )}
          </>
        )}

        {/* Stripe — succès */}
        {isDone && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <p className="font-semibold text-slate-800">Réservation confirmée !</p>
            <p className="text-xs text-slate-400 text-center">Vous recevrez une confirmation par email.</p>
          </div>
        )}

        {/* PayPal */}
        {paymentMethod === 'paypal' && !isDone && (
          <button
            onClick={handlePayPalPayment}
            disabled={isLocked}
            className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-yellow-900 font-bold rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isLocked ? (
              <><Loader2 size={16} className="animate-spin" /> Un instant…</>
            ) : (
              '🅿️ Payer avec PayPal'
            )}
          </button>
        )}

        {/* Mention sécurité */}
        {!isDone && (
          <p className="text-[11px] text-slate-400 text-center">
            🔒 Paiement sécurisé — vos données ne transitent pas par nos serveurs
          </p>
        )}
      </div>
    </div>
  );
};

PaymentForm.propTypes = {
  reservationId:    PropTypes.number.isRequired,
  onClose:          PropTypes.func.isRequired,
  onPaymentSuccess: PropTypes.func,
};

export default PaymentForm;