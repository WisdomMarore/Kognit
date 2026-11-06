import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import AppLayout from '../components/AppLayout';
import Spinner from '../components/Spinner';

const PERKS = [
  'AI flashcards from your notes, PDFs and photos',
  'Daily spaced-repetition review',
  'Recall quizzes and multiple-choice quizzes',
  'Streaks to keep you consistent',
];

export default function Billing() {
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState('loading'); // loading | idle | sending | pending | paid | failed | already
  const [message, setMessage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const pollRef = useRef(null);
  const navigate = useNavigate();
  const expired = new URLSearchParams(window.location.search).get('expired') === '1';

  useEffect(() => {
    client.get('/dashboard/')
      .then((res) => setStage(res.data.subscription_status === 'active' ? 'already' : 'idle'))
      .catch(() => setStage('idle'));
    return () => clearInterval(pollRef.current);
  }, []);

  function startPolling() {
    let attempts = 0;
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const res = await client.get('/billing/check/');
        if (res.data.payment === 'paid') {
          clearInterval(pollRef.current);
          setStage('paid');
          return;
        }
        if (res.data.payment === 'failed') {
          clearInterval(pollRef.current);
          setMessage('The payment was cancelled or declined, so it was not completed.');
          setStage('failed');
          return;
        }
      } catch (e) {
        // network hiccup: keep polling
      }
      if (attempts >= 45) {
        clearInterval(pollRef.current);
        setMessage("We didn't receive confirmation. If money left your account, email marorew@gmail.com and we'll sort it out.");
        setStage('failed');
      }
    }, 4000);
  }

  async function handlePay(e) {
    e.preventDefault();
    setMessage('');
    if (!/^0\d{9}$/.test(phone)) {
      setMessage('Enter a 10-digit EcoCash number starting with 0, e.g. 0771234567');
      return;
    }
    setStage('sending');
    try {
      const res = await client.post('/billing/subscribe/', { phone_number: phone });
      setInstructions(res.data.instructions);
      setStage('pending');
      startPolling();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Could not start payment. Please try again.');
      setStage('idle');
    }
  }

  async function handleCheckout() {
    setMessage('');
    setCheckoutLoading(true);
    try {
      const res = await client.post('/billing/checkout/');
      window.location.href = res.data.redirect_url;
    } catch (err) {
      setCheckoutLoading(false);
      setMessage(err.response?.data?.detail || 'Could not start checkout. Please try again.');
    }
  }

  function startOver() {
    clearInterval(pollRef.current);
    setMessage('');
    setStage('idle');
  }

  if (stage === 'loading') {
    return (
      <AppLayout>
        <div className="p-10 text-sand">Loading...</div>
      </AppLayout>
    );
  }

  if (stage === 'paid' || stage === 'already') {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto px-8 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-moss/20 border border-moss flex items-center justify-center mx-auto mb-6">
            <span className="text-moss text-2xl">✓</span>
          </div>
          <h1 className="font-display text-2xl text-paper mb-2">
            {stage === 'paid' ? 'Payment received' : "You're subscribed"}
          </h1>
          <p className="text-sand mb-8">Your subscription is active. Happy studying.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-ember text-ink px-6 py-2.5 rounded-full font-semibold hover:bg-ember-dark"
          >
            Back to dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  const busy = stage === 'sending' || stage === 'pending';

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-8 py-10">
        <h1 className="font-display text-3xl text-paper mb-1">Subscribe to Kognit</h1>
        <p className="text-sand mb-8">Pay month to month. Nothing is charged automatically.</p>

{expired && (
  <div className="surface surface-hero text-ember text-sm px-4 py-3 mb-6">
    Your access has ended. Subscribe to keep studying. Your decks and progress are saved.
  </div>
)}

        <div className="surface p-8 ">
          <div className="flex items-baseline gap-2 mb-6">
            <span className="font-display text-5xl text-paper">$4.99</span>
            <span className="text-sand">/ month</span>
          </div>

          <ul className="space-y-3 mb-8">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm text-sand">
                <span className="text-ember">✓</span>
                {perk}
              </li>
            ))}
          </ul>

          <div className="border-t border-sand/10 pt-6">
            {message && (
              <p className="text-rose text-sm mb-4">{message}</p>
            )}

            <form onSubmit={handlePay}>
              <label className="block text-sm font-medium text-sand mb-1">EcoCash number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0771234567"
                disabled={busy}
                className="w-full border border-sand/20 bg-ink text-paper rounded-sm px-3 py-2 mb-4 focus:outline-none focus:border-ember disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-ember text-ink py-2.5 rounded-full font-semibold hover:bg-ember-dark disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy && <Spinner />}
                {stage === 'sending' && 'Sending request...'}
                {stage === 'pending' && 'Waiting for your approval...'}
                {!busy && 'Pay $4.99 with EcoCash'}
              </button>
            </form>

            {stage === 'pending' && (
              <div className="mt-4 text-center">
                <p className="text-sm text-sand">{instructions}</p>
                <button onClick={startOver} className="text-xs text-sand/60 underline mt-2 hover:text-sand">
                  Use a different number
                </button>
              </div>
            )}

            {!busy && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-sand/10" />
                  <span className="text-xs text-sand/50">or</span>
                  <div className="flex-1 h-px bg-sand/10" />
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full border border-sand/20 text-sand py-2.5 rounded-full hover:border-ember hover:text-ember transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {checkoutLoading && <Spinner />}
                  Pay another way (Zimswitch, bank and more)
                </button>
                <p className="text-xs text-sand/50 text-center mt-2">Opens Paynow's secure payment page.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}