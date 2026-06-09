import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';

const stripePromise = loadStripe("pk_test_51RXnftAc9vHWOsmYRgXSBdNEne7MxfObedkDBDRtA7l5G2zZM0sfMPfhHmCtWqeNIM81YSEyREpIPVDg76hE201t002UNapsv0");

// =========================
// CHECKOUT FORM
// =========================
const CheckoutForm = ({ clientSecret, reservationId, onSuccess, onError, onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

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
        onSuccess('Paiement réussi.');

        // 👉 NOTIFY PARENT (PAS DE RELOAD)
        onPaid?.();

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
        <CardElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded w-full"
      >
        {loading ? "Paiement..." : "Payer"}
      </button>
    </form>
  );
};

// =========================
// PAYMENT FORM
// =========================
const PaymentForm = ({ reservationId, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [clientSecret, setClientSecret] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const createPayment = async () => {
    const res = await api.post('/payments/create', {
      reservationId,
      paymentMethod,
      successUrl: window.location.origin + '/payment-success',
      cancelUrl: window.location.origin + '/payment-cancel',
      currency: 'EUR',
    });
    return res.data;
  };

  // =========================
  // STRIPE INIT
  // =========================
  useEffect(() => {
    if (paymentMethod !== 'stripe') return;

    let ignore = false;

    setLoading(true);
    setMessage(null);
    setClientSecret(null);

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
          const msg = err.response?.data?.message || "Erreur paiement.";
          setMessage({ type: 'error', text: msg });
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [paymentMethod, reservationId]);

  // =========================
  // PAYPAL
  // =========================
  const handlePayPalPayment = async () => {
    setLoading(true);
    try {
      const data = await createPayment();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Erreur PayPal" });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  return (
    <div className="bg-white p-6 rounded-xl w-full max-w-md relative">

      <button onClick={onClose} className="absolute right-3 top-2 text-xl">×</button>

      <h2 className="text-lg font-bold mb-4 text-center">Paiement</h2>

      {/* SWITCH */}
      <div className="flex gap-3 justify-center mb-4">
        <button onClick={() => setPaymentMethod('stripe')}>
          Stripe
        </button>
        <button onClick={() => setPaymentMethod('paypal')}>
          PayPal
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="text-center mb-3 text-sm text-red-500">
          {message.text}
        </div>
      )}

      {/* STRIPE */}
      {paymentMethod === 'stripe' && (
        <>
          {loading && <p>Chargement...</p>}

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                reservationId={reservationId}
                onSuccess={(msg) => setMessage({ type: 'success', text: msg })}
                onError={(msg) => setMessage({ type: 'error', text: msg })}
                onPaid={() => {
                  // 🔥 IMPORTANT : refresh SANS reload page
                  onPaymentSuccess?.();
                }}
              />
            </Elements>
          )}
        </>
      )}

      {/* PAYPAL */}
      {paymentMethod === 'paypal' && (
        <button onClick={handlePayPalPayment} disabled={loading}>
          {loading ? "Redirection..." : "Payer avec PayPal"}
        </button>
      )}
    </div>
  );
};

PaymentForm.propTypes = {
  reservationId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onPaymentSuccess: PropTypes.func, // 🔥 important
};

export default PaymentForm;