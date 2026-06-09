import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';

const stripePromise = loadStripe("pk_test_51RXnftAc9vHWOsmYRgXSBdNEne7MxfObedkDBDRtA7l5G2zZM0sfMPfhHmCtWqeNIM81YSEyREpIPVDg76hE201t002UNapsv0");

// =========================
// CHECKOUT FORM
// =========================
const CheckoutForm = ({ clientSecret, reservationId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
const interval = setInterval(async () => {
  const res = await api.get(`/reservations/${reservationId}`);

  if (res.data.statut === "PAYE") {
    clearInterval(interval);
    window.location.reload();
  }
}, 2000);
 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!stripe || !elements) {
    onError("Stripe n'est pas prêt.");
    return;
  }

  setLoading(true);

  const cardElement = elements.getElement(CardElement);

  try {
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (result.error) {
      onError(result.error.message);
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {

      // ⚠️ OPTIONNEL (mais ton backend webhook doit suffire)
      try {
        await api.post('/payments/confirm', {
          reservationId,
        });
      } catch (err) {
        console.log("confirm error:", err);
      }

      onSuccess('Paiement réussi.');

      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return;
    }

    onError('Paiement échoué.');

  } catch (err) {
    onError('Erreur : ' + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-md p-3">
        <CardElement options={{
          style: {
            base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
            invalid: { color: '#9e2146' },
          }
        }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded w-full font-medium transition"
      >
        {loading ? "Paiement en cours..." : "Payer avec Stripe"}
      </button>
    </form>
  );
};

CheckoutForm.propTypes = {
  clientSecret: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

// =========================
// PAYMENT FORM
// =========================
const PaymentForm = ({ reservationId, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [clientSecret, setClientSecret] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const createPayment = async () => {
    // ✅ FIX : utilise api.js (baseURL Railway + token JWT automatique)
    const res = await api.post('/payments/create', {
      reservationId,
      paymentMethod,
      successUrl: window.location.origin + '/payment-success',
      cancelUrl: window.location.origin + '/payment-cancel',
      currency: 'EUR',
    });
    return res.data;
  };

  // Stripe init
  useEffect(() => {
    if (paymentMethod !== 'stripe') return;

    let ignore = false;
    setClientSecret(null);
    setMessage(null);
    setLoading(true);

    createPayment()
      .then((data) => {
        if (!ignore) {
          if (data?.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            setMessage({ type: 'error', text: "Impossible d'initialiser le paiement." });
          }
        }
      })
      .catch((err) => {
        if (!ignore) {
          // ✅ FIX : affiche le vrai message d'erreur du backend
          const msg = err.response?.data?.message
            || err.response?.data
            || "Erreur lors de l'initialisation du paiement.";
          setMessage({ type: 'error', text: typeof msg === 'string' ? msg : JSON.stringify(msg) });
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, [paymentMethod, reservationId]);

  // PayPal
  const handlePayPalPayment = async () => {
    setLoading(true);
    try {
      const data = await createPayment();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        setMessage({ type: 'error', text: "URL PayPal non reçue." });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Erreur PayPal.";
      setMessage({ type: 'error', text: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800"
      >
        ×
      </button>

      <h2 className="text-xl font-bold text-center mb-6">Paiement</h2>

      {/* Choix méthode */}
      <div className="flex gap-4 mb-6 justify-center">
        <button
          onClick={() => setPaymentMethod('stripe')}
          className={`px-4 py-2 rounded-lg border font-medium transition ${
            paymentMethod === 'stripe'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          Stripe
        </button>
        <button
          onClick={() => setPaymentMethod('paypal')}
          className={`px-4 py-2 rounded-lg border font-medium transition ${
            paymentMethod === 'paypal'
              ? 'bg-yellow-400 text-white border-yellow-400'
              : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400'
          }`}
        >
          PayPal
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`text-center mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stripe */}
      {paymentMethod === 'stripe' && (
        <>
          {loading && (
            <p className="text-center text-blue-500 text-sm">Chargement paiement...</p>
          )}
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
              <CheckoutForm
  clientSecret={clientSecret}
  reservationId={reservationId}
  onSuccess={(msg) => setMessage({ type: 'success', text: msg })}
  onError={(msg) => setMessage({ type: 'error', text: msg })}
/>
            </Elements>
          )}
        </>
      )}

      {/* PayPal */}
      {paymentMethod === 'paypal' && (
        <button
          onClick={handlePayPalPayment}
          disabled={loading}
          className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-white font-semibold rounded-lg transition"
        >
          {loading ? "Redirection..." : "Payer avec PayPal"}
        </button>
      )}
    </div>
  );
};

PaymentForm.propTypes = {
  reservationId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PaymentForm;