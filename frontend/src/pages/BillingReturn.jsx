import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import AppLayout from '../components/AppLayout';

export default function BillingReturn() {
  const [state, setState] = useState('checking'); // checking | paid | failed | timeout
  const navigate = useNavigate();

  useEffect(() => {
    let attempts = 0;
    let timer;

    async function check() {
      attempts += 1;
      try {
        const res = await client.get('/billing/check/');
        if (res.data.payment === 'paid') { setState('paid'); return; }
        if (res.data.payment === 'failed') { setState('failed'); return; }
      } catch (e) {
        // keep trying
      }
      if (attempts >= 10) { setState('timeout'); return; }
      timer = setTimeout(check, 3000);
    }

    check();
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-8 py-16 text-center">
        {state === 'checking' && <p className="text-sand">Confirming your payment...</p>}

        {state === 'paid' && (
          <>
            <h1 className="font-display text-2xl text-paper mb-2">Payment received</h1>
            <p className="text-sand mb-8">Your subscription is active.</p>
            <button onClick={() => navigate('/dashboard')} className="bg-ember text-ink px-6 py-2.5 rounded-full font-semibold hover:bg-ember-dark">
              Back to dashboard
            </button>
          </>
        )}

        {state === 'failed' && (
          <>
            <h1 className="font-display text-2xl text-paper mb-2">Payment not completed</h1>
            <p className="text-sand mb-8">It was cancelled or declined.</p>
            <button onClick={() => navigate('/billing')} className="text-ember underline">Try again</button>
          </>
        )}

        {state === 'timeout' && (
          <>
            <h1 className="font-display text-2xl text-paper mb-2">Still waiting</h1>
            <p className="text-sand mb-8">We haven't received confirmation yet. If you paid, it can take a few minutes.</p>
            <button onClick={() => navigate('/billing')} className="text-ember underline">Back to billing</button>
          </>
        )}
      </div>
    </AppLayout>
  );
}