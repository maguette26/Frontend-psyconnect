import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe("pk_test_51RXngePPIpwqHP0R7oDQfgGLbnkvgjGj1j8FnWSxa8G92FeO4XXXmDfflJC8vjCiYgfb3xtzGSuSlDipQzf4jlDH00KASAjcYd");


// =========================
// CHECKOUT FORM
// =========================
const CheckoutForm = ({ clientSecret, onSuccess, onError }) => {
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
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess('Paiement réussi.');
      } else {
        onError('Paiement échoué.');
      }
    } catch (err) {
      onError('Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded w-full"
      >
        {loading ? "Paiement..." : "Payer avec Stripe"}
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
    const res = await axios.post(
      '/api/payments/create',
      {
        reservationId,
        paymentMethod,
        successUrl: window.location.origin + '/payment-success',
        cancelUrl: window.location.origin + '/payment-cancel',
        currency: 'EUR',
      },
      { withCredentials: true }
    );

    return res.data;
  };


  // =========================
  // STRIPE INIT FIX
  // =========================
  useEffect(() => {
    if (paymentMethod !== 'stripe') return;

    let ignore = false;
    setClientSecret(null);
    setMessage(null);

    setLoading(true);

    createPayment()
      .then((data) => {
        if (!ignore && data?.clientSecret) {
          setClientSecret(data.clientSecret);
        } else if (!ignore) {
          setMessage({ type: 'error', text: "clientSecret manquant." });
        }
      })
      .catch(() => {
        if (!ignore) {
          setMessage({
            type: 'error',
            text: "Erreur backend ou validation requise.",
          });
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
    try {
      const data = await createPayment();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        setMessage({ type: 'error', text: "URL PayPal non reçue." });
      }
    } catch {
      setMessage({ type: 'error', text: "Erreur PayPal." });
    }
  };


  return (
    <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative">

      <button onClick={onClose} className="absolute top-4 right-4 text-2xl">
        ×
      </button>

      <h2 className="text-xl font-bold text-center mb-6">
        Paiement
      </h2>

      {/* choix paiement */}
      <div className="flex gap-4 mb-6 justify-center">
        <button onClick={() => setPaymentMethod('stripe')}>
          Stripe
        </button>

        <button onClick={() => setPaymentMethod('paypal')}>
          PayPal
        </button>
      </div>

      {message && (
        <p className="text-center mb-4">
          {message.text}
        </p>
      )}

      {loading && paymentMethod === 'stripe' && (
        <p className="text-center text-blue-500">
          Chargement paiement...
        </p>
      )}

      {/* STRIPE SAFE RENDER */}
      {paymentMethod === 'stripe' && clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret }}
          key={clientSecret}   // 🔥 FIX IMPORTANT
        >
          <CheckoutForm
            clientSecret={clientSecret}
            onSuccess={(msg) => setMessage({ type: 'success', text: msg })}
            onError={(msg) => setMessage({ type: 'error', text: msg })}
          />
        </Elements>
      )}

      {/* PAYPAL */}
      {paymentMethod === 'paypal' && (
        <button onClick={handlePayPalPayment}>
          Payer avec PayPal
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