import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, LockKeyhole, Smartphone } from 'lucide-react';
import { useCart } from '../../context/cartState';
import { createDemoOrder } from '../../data/orders';

const PENDING_PAYMENT_KEY = 'shusthobazaar_pending_payment';
const paymentMethods = [
  { id: 'bkash', name: 'bKash', detail: 'Mobile wallet', icon: Smartphone },
  { id: 'nagad', name: 'Nagad', detail: 'Mobile wallet', icon: Smartphone },
  { id: 'card', name: 'Visa / Mastercard', detail: 'Credit or debit card', icon: CreditCard },
];

function readPendingCheckout() {
  try {
    return JSON.parse(window.sessionStorage.getItem(PENDING_PAYMENT_KEY) || 'null');
  } catch (error) {
    console.error('Unable to restore the pending sandbox payment.', error);
    window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    return null;
  }
}

export function PaymentReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [pendingCheckout] = useState(readPendingCheckout);
  const processed = useRef(false);
  const status = searchParams.get('status');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (!pendingCheckout || processed.current) return;
    if (status !== 'success') {
      processed.current = true;
      window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
      return;
    }

    processed.current = true;
    try {
      const order = createDemoOrder(pendingCheckout, {
        method: 'Payment sandbox',
        status: 'Paid (sandbox)',
        reference: paymentId,
      });
      clearCart();
      window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
      window.sessionStorage.removeItem('shusthobazaar_checkout_draft');
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (error) {
      processed.current = false;
      console.error('Unable to complete the returned sandbox order.', error);
    }
  }, [clearCart, navigate, paymentId, pendingCheckout, status]);

  const message = !pendingCheckout
    ? 'No pending order was found. Your cart has not been changed.'
    : status === 'success'
      ? 'Payment was approved by the sandbox. Completing your order…'
      : 'Payment was not completed. Your cart and checkout draft are still saved.';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex items-center justify-center gap-2">
          <img src="/logo.png" alt="" className="h-12 w-9 object-contain" />
          <span className="text-xl font-extrabold tracking-tight text-teal-900">shusthoBazaar</span>
        </div>
        <p className="mt-8 text-slate-600">{message}</p>
        <Link to="/checkout" className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white">Return to checkout</Link>
      </div>
    </main>
  );
}

export default function PaymentSandbox() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [method, setMethod] = useState('bkash');
  const [status, setStatus] = useState('');
  const [pendingCheckout] = useState(readPendingCheckout);
  const completed = useRef(false);

  const finishPayment = (success) => {
    if (!pendingCheckout || completed.current) return;
    if (!success) {
      setStatus('Payment declined in the sandbox. Your cart is unchanged; you can retry or return to checkout.');
      return;
    }

    completed.current = true;
    try {
      const order = createDemoOrder(pendingCheckout, {
        method: paymentMethods.find((entry) => entry.id === method)?.name || 'Payment sandbox',
        status: 'Paid (sandbox)',
        reference: `DEMO-${Date.now()}`,
      });
      clearCart();
      window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
      window.sessionStorage.removeItem('shusthobazaar_checkout_draft');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      completed.current = false;
      console.error('Unable to complete the sandbox order.', error);
      setStatus(error.message);
    }
  };

  if (!pendingCheckout) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">No pending payment</h1>
          <p className="mt-3 text-sm text-slate-600">Start checkout to create a sandbox payment session.</p>
          <Link to="/cart" className="mt-5 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white">Back to cart</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-white px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[0.85fr_1.15fr]">
        <aside className="rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700 p-7 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-12 w-9 object-contain" />
            <span className="text-xl font-extrabold tracking-tight text-white">shusthoBazaar</span>
          </div>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-teal-100">Sandbox payment</p>
          <h1 className="mt-2 text-2xl font-bold">Order payment</h1>
          <p className="mt-2 text-sm text-teal-100">Sandbox only. No account, PIN, card details, or funds are submitted or stored.</p>
          <div className="mt-8 border-t border-white/20 pt-5">
            <p className="text-xs uppercase tracking-widest text-teal-100">Total amount</p>
            <p className="mt-1 text-4xl font-black">৳{pendingCheckout.total}</p>
            <p className="mt-2 text-sm text-teal-100">Invoice · ShusthoBazaar medicine order</p>
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <Link to="/checkout" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700">
            <ArrowLeft className="h-4 w-4" /> Back to checkout
          </Link>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700"><LockKeyhole className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Choose a sandbox method</h2>
              <p className="text-sm text-slate-500">Inspired by the payment options in paymentSandbox.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {paymentMethods.map(({ id, name, detail, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setMethod(id)} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${method === id ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 hover:border-slate-300'}`}>
                <Icon className="h-5 w-5 text-teal-700" />
                <span className="flex-1"><span className="block font-semibold text-slate-900">{name}</span><span className="text-sm text-slate-500">{detail}</span></span>
                {method === id && <CheckCircle2 className="h-5 w-5 text-teal-700" />}
              </button>
            ))}
          </div>

          {status && <p role="status" className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{status}</p>}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => finishPayment(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Simulate decline</button>
            <button type="button" onClick={() => finishPayment(true)} className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800">Simulate successful payment</button>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            Payment gateway credit: <a href="https://github.com/fatinaman/paymentSandbox" target="_blank" rel="noreferrer" className="font-semibold text-teal-700 underline">fatinaman/paymentSandbox</a>
          </p>
        </section>
      </div>
    </main>
  );
}
