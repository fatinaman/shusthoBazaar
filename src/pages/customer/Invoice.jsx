import { Link, useParams } from 'react-router-dom';
import { Printer, Download } from 'lucide-react';
import { getDemoOrders } from '../../data/orders';

const defaultInvoice = {
  id: 'INV-2026-89241',
  orderId: 'SB-89241',
  customer: 'Dr. Aminul Islam',
  address: 'House 42, Road 11, Banani, Dhaka',
  paymentMethod: 'Cash on Delivery',
  paymentStatus: 'Pending',
  createdAt: '2026-11-09',
  items: [
    { name: 'Napa Extra', quantity: 2, unitPrice: 35 },
    { name: 'Seclo 20mg', quantity: 1, unitPrice: 70 },
  ],
  subtotal: 140,
  deliveryFee: 60,
  total: 200,
};

export default function Invoice() {
  const { id } = useParams();
  const savedOrder = getDemoOrders().find((entry) => entry.id === id);
  const order = savedOrder || (id === defaultInvoice.orderId ? defaultInvoice : null);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Invoice not found</h1>
        <p className="mt-2 text-slate-600">There is no invoice for this order in the current demo account.</p>
        <Link to="/products" className="mt-5 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white">Browse medicines</Link>
      </div>
    );
  }

  const items = order.items || defaultInvoice.items;
  const subtotal = order.subtotal ?? items.reduce((sum, item) => sum + item.quantity * (item.price || item.unitPrice), 0);
  const deliveryFee = order.shippingFee ?? defaultInvoice.deliveryFee;
  const total = order.total ?? subtotal + deliveryFee;
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
            <p className="text-xl font-bold text-slate-900">{order.id || defaultInvoice.id}</p>
            <p className="mt-1 text-sm text-slate-500">Issued on {new Date(order.createdAt || defaultInvoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Bill to</p>
            <p className="mt-3 font-bold text-slate-900">{order.customer || 'Dr. Aminul Islam'}</p>
            <p className="text-sm text-slate-600">{address || defaultInvoice.address}</p>
          </div>

          <div className="md:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Payment</p>
            <p className="mt-3 text-sm text-slate-600">Method: {order.paymentMethod || defaultInvoice.paymentMethod}</p>
            <p className="text-sm text-slate-600">Status: {order.paymentStatus || defaultInvoice.paymentStatus}</p>
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
              {(items || defaultInvoice.items).map((item) => (
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
