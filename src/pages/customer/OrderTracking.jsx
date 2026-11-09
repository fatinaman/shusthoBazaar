import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock3, MapPin, PackageCheck, Truck } from 'lucide-react';
import { getDemoOrders } from '../../data/orders';

const defaultOrder = {
  id: 'SB-89241',
  customer: 'Dr. Aminul Islam',
  address: 'House 42, Road 11, Banani, Dhaka',
  paymentMethod: 'Cash on Delivery',
  paymentStatus: 'Pending',
  total: 500,
  status: 'Confirmed',
  createdAt: '2026-11-09T12:00:00Z',
  items: [
    { name: 'Napa Extra', quantity: 2, price: 35 },
    { name: 'Seclo 20mg', quantity: 1, price: 70 },
  ],
};

const steps = [
  { key: 'Placed', label: 'Placed', icon: Clock3 },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: PackageCheck },
];

export default function OrderTracking() {
  const { id } = useParams();
  const savedOrder = getDemoOrders().find((entry) => entry.id === id);
  const order = savedOrder || (id === defaultOrder.id ? defaultOrder : null);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Order not found</h1>
        <p className="mt-2 text-slate-600">This order is not available in the current demo account.</p>
        <Link to="/products" className="mt-5 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white">Browse medicines</Link>
      </div>
    );
  }

  const address = typeof order.address === 'string'
    ? order.address
    : [order.address?.street, order.address?.city, order.address?.postalCode].filter(Boolean).join(', ');

  const currentIndex = steps.findIndex((step) => step.key === order.status);
  const statusIndex = currentIndex >= 0 ? currentIndex : 0;
  const isRejected = order.status === 'Rejected';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Order tracking</p>
          <h1 className="text-3xl font-bold text-slate-900">Order {order.id}</h1>
        </div>
        <Link to={`/orders/${order.id}/invoice`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300">
          Download invoice
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const active = !isRejected && index <= statusIndex;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Step {index + 1}</p>
                    <p className={`text-sm font-semibold ${active ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm text-slate-500">Current status</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{order.status}</p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {order.paymentStatus}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">Estimated delivery: 12:30 PM today</p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Items in this order</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">৳{item.quantity * (item.price || item.unitPrice)}</p>
                    <p className="text-xs text-slate-500">৳{item.price || item.unitPrice} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Delivery details</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-teal-700" />
                <div>
                  <p className="font-semibold text-slate-900">Delivery address</p>
                  <p>{address || defaultOrder.address}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Payment method</p>
                <p>{order.paymentMethod}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Placed on</p>
                <p>{new Date(order.createdAt || defaultOrder.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Payment summary</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">৳{order.subtotal ?? order.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span className="font-semibold text-slate-900">৳{order.shippingFee || 0}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 font-bold text-slate-900">
                <span>Total</span>
                <span>৳{order.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment</span>
                <span className="font-semibold text-slate-900">{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
