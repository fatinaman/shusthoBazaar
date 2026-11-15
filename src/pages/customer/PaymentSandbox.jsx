import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CreditCard, LockKeyhole } from 'lucide-react';
import { api } from '../../services/api';

export default function PaymentSandbox() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutReference = searchParams.get('checkoutReference');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const completePayment = async (result) => {
    if (!checkoutReference || submitting) return;
    setSubmitting(true);
    setStatus('');
    try {
      const { orders } = await api.payments.completeMock({ checkoutReference, result });
      navigate(`/orders/${orders[0].id}`, { replace: true });
    } catch (requestError) {
      setStatus(requestError.message);
      setSubmitting(false);
    }
  };

  if (!checkoutReference) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">No pending mock payment</h1>
          <p className="mt-3 text-sm text-slate-600">Start checkout to create a mock payment record.</p>
          <Link to="/cart" className="mt-5 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white">Back to cart</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-white px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Local payment mock</p>
            <h1 className="text-2xl font-bold text-slate-900">Choose a test outcome</h1>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600">
          This screen only records a simulated result in the local SQLite database. It does not open a gateway, collect card or wallet details, or move real money.
        </p>
        <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          Checkout reference: <code>{checkoutReference}</code>
        </div>
        {status && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{status}</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" disabled={submitting} onClick={() => completePayment('failed')} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60">
            Simulate decline
          </button>
          <button type="button" disabled={submitting} onClick={() => completePayment('success')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
            <CreditCard className="h-4 w-4" /> {submitting ? 'Saving result…' : 'Simulate success'}
          </button>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5" /> No real payment credentials are requested.
        </p>
      </div>
    </main>
  );
}
