import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Printer, Download } from 'lucide-react';
import { api } from '../../services/api';

export default function Invoice() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.orders.invoice(id)
      .then(setOrder)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p role="status" className="p-12 text-center text-sm text-slate-600">Loading invoice…</p>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Invoice not found</h1>
        <p className="mt-2 text-slate-600">{error || 'There is no invoice for this order in your account.'}</p>
        <Link to="/products" className="mt-5 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white">Browse medicines</Link>
      </div>
    );
  }

  const items = order.items;
  const subtotal = order.subtotal;
  const deliveryFee = order.deliveryFee;
  const total = order.total;
  const address = typeof order.address === 'string'
    ? order.address
    : [order.address?.street, order.address?.city, order.address?.postalCode].filter(Boolean).join(', ');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Invoice</p>
          <h1 className="text-3xl font-bold text-slate-900">Digital invoice</h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
            <Printer className="h-4 w-4" /> Print
          </button>
          <Link to={`/orders/${id}`} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">
            <Download className="h-4 w-4" /> Back to order
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs print:shadow-none">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <img src="/logo.png" alt="" className="h-12 w-9 object-contain" />
              <span className="text-xl font-extrabold tracking-tight text-teal-900">shusthoBazaar</span>
            </div>
            <p className="text-sm text-slate-600">Verified pharmacy marketplace</p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-slate-500">Invoice No.</p>
            <p className="text-xl font-bold text-slate-900">{order.invoiceNo}</p>
            <p className="mt-1 text-sm text-slate-500">Issued on {new Date(order.issuedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Bill to</p>
            <p className="mt-3 font-bold text-slate-900">{order.customer || 'Dr. Aminul Islam'}</p>
            <p className="text-sm text-slate-600">{address}</p>
          </div>

          <div className="md:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Payment</p>
            <p className="mt-3 text-sm text-slate-600">Method: {order.paymentMethod}</p>
            <p className="text-sm text-slate-600">Status: {order.paymentStatus}</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Item</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Qty</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Unit price</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((item) => (
                <tr key={item.name}>
                  <td className="px-4 py-3 text-sm text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">৳{item.unitPrice || item.price}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">৳{(item.unitPrice || item.price) * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 ml-auto max-w-sm space-y-3 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">৳{subtotal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Delivery</span>
            <span className="font-semibold text-slate-900">৳{deliveryFee}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>Total payable</span>
            <span className="text-teal-700">৳{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
