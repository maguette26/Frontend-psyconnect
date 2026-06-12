import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';

const stripePromise = loadStripe("pk_test_51RXnftAc9vHWOsmYRgXSBdNEne7MxfObedkDBDRtA7l5G2zZM0sfMPfhHmCtWqeNIM81YSEyREpIPVDg76hE201t002UNapsv0");

// ─── Utilitaire : wake-up Railway + retry ────────────────────────────
const MAX_RETRIES   = 5;
const RETRY_DELAY   = 2500; // ms entre chaque tentative
const HEALTH_ROUTE  = '/actuator/health';   // adapte selon ton backend

async function wakeUpAndRetry(fn, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const is503 = err?.response?.status === 503 || err?.response?.status === 502;
      const isNet = !err?.response;   // ECONNREFUSED / réseau
      if ((is503 || isNet) && i < retries - 1) {
        // Tente un ping health pour réveiller le container
        try { await api.get(HEALTH_ROUTE); } catch (_) {}
        await new Promise(r => setTimeout(r, RETRY_DELAY * (i + 1)));
      } else {
        throw err;
      }
    }
  }
}

// ─── Polling statut réservation ──────────────────────────────────────
async function pollReservationStatus(reservationId, targetStatus, timeoutMs = 30000) {
  const interval = 2000;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const { data } = await api.get(`/reservations/${reservationId}`);
      if (data?.statut === targetStatus || data?.paiement?.statut === 'VALIDE') return data;
    } catch (_) {}
    await new Promise(r => setTimeout(r, interval));
  }
  return null;
}

// =========================
// CHECKOUT FORM
// =========================
const CheckoutForm = ({ clientSecret, reservationId, onSuccess, onError, onPaid }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) { onError("Stripe n'est pas prêt."); return; }
    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) { onError(result.error.message); return; }

      if (result.paymentIntent?.status === 'succeeded') {
        onSuccess('Paiement accepté. Mise à jour en cours…');
        setPolling(true);

        // Polling : on attend que le backend confirme le changement de statut
        const updated = await pollReservationStatus(reservationId, 'VALIDE');
        setPolling(false);

        if (updated) {
          onSuccess('Paiement confirmé et réservation mise à jour !');
        } else {
          // Le backend est peut-être en veille → on notifie quand même
          onSuccess('Paiement confirmé. La mise à jour apparaîtra dans quelques instants.');
        }
        onPaid?.();
        return;
      }
      onError('Paiement non abouti, veuillez réessayer.');
    } catch (err) {
      onError('Erreur : ' + (err.message || 'inconnue'));
    } finally {
      setLoading(false);
      setPolling(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-xl p-4 bg-gray-50">
        <CardElement options={{
          style: {
            base: { fontSize: '16px', color: '#1e293b', '::placeholder': { color: '#94a3b8' } },
          }
        }} />
      </div>

      {polling && (
        <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 rounded-xl px-4 py-3">
          <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Synchronisation avec le serveur…
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || polling}
        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl w-full font-semibold transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Paiement en cours…
          </>
        ) : 'Payer maintenant'}
      </button>
    </form>
  );
};

// =========================
// PAYMENT FORM
// =========================
const PaymentForm = ({ reservationId, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [clientSecret, setClientSecret]   = useState(null);
  const [message, setMessage]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [serverWaking, setServerWaking]   = useState(false);

  const createPayment = useCallback(() =>
    api.post('/payments/create', {
      reservationId,
      paymentMethod,
      successUrl: window.location.origin + '/payment-success',
      cancelUrl:  window.location.origin + '/payment-cancel',
      currency: 'EUR',
    }).then(r => r.data)
  , [reservationId, paymentMethod]);

  // ─── Stripe init avec wake-up auto ──────────────────────────────
  useEffect(() => {
    if (paymentMethod !== 'stripe') return;
    let ignore = false;
    setLoading(true);
    setServerWaking(false);
    setMessage(null);
    setClientSecret(null);

    const timer = setTimeout(() => !ignore && setServerWaking(true), 1500);

    wakeUpAndRetry(createPayment)
      .then(data => {
        if (ignore) return;
        clearTimeout(timer);
        setServerWaking(false);
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setMessage({ type: 'error', text: "Impossible d'initialiser le paiement." });
        }
      })
      .catch(err => {
        if (ignore) return;
        clearTimeout(timer);
        setServerWaking(false);
        const msg = err.response?.data?.message || "Serveur indisponible, réessayez dans quelques secondes.";
        setMessage({ type: 'error', text: msg });
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; clearTimeout(timer); };
  }, [paymentMethod, reservationId]);

  // ─── PayPal avec wake-up auto ────────────────────────────────────
  const handlePayPalPayment = async () => {
    setLoading(true);
    setServerWaking(false);
    const timer = setTimeout(() => setServerWaking(true), 1500);
    try {
      const data = await wakeUpAndRetry(createPayment);
      clearTimeout(timer);
      if (data.approvalUrl) window.location.href = data.approvalUrl;
    } catch {
      clearTimeout(timer);
      setMessage({ type: 'error', text: "Erreur PayPal, veuillez réessayer." });
    } finally {
      setLoading(false);
      setServerWaking(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-xl">

      <button onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>

      <h2 className="text-xl font-bold mb-5 text-center text-slate-800">Paiement sécurisé</h2>

      {/* Avertissement wake-up serveur */}
      {serverWaking && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-4">
          <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span>Le serveur se réveille, un instant…</span>
        </div>
      )}

      {/* Switch méthode */}
      <div className="flex gap-2 mb-5">
        {['stripe', 'paypal'].map(m => (
          <button key={m} onClick={() => setPaymentMethod(m)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
              paymentMethod === m
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}>
            {m === 'stripe' ? '💳 Carte bancaire' : '🅿️ PayPal'}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div className={`text-sm rounded-xl px-4 py-3 mb-4 ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stripe */}
      {paymentMethod === 'stripe' && (
        <>
          {loading && !serverWaking && (
            <p className="text-sm text-slate-400 text-center py-4">Initialisation…</p>
          )}
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                reservationId={reservationId}
                onSuccess={msg => setMessage({ type: 'success', text: msg })}
                onError={msg => setMessage({ type: 'error', text: msg })}
                onPaid={() => onPaymentSuccess?.()}
              />
            </Elements>
          )}
        </>
      )}

      {/* PayPal */}
      {paymentMethod === 'paypal' && (
        <button onClick={handlePayPalPayment} disabled={loading}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-yellow-900 font-bold rounded-xl transition">
          {loading ? 'Redirection…' : 'Payer avec PayPal'}
        </button>
      )}
    </div>
  );
};

PaymentForm.propTypes = {
  reservationId:    PropTypes.number.isRequired,
  onClose:          PropTypes.func.isRequired,
  onPaymentSuccess: PropTypes.func,
};

export default PaymentForm;