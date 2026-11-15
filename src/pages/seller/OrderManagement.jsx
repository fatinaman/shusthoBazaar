import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, PackageCheck } from 'lucide-react';
import { api } from '../../services/api';

const nextOrderStatus = {
  Placed: { status: 'confirmed', label: 'Confirm', icon: CheckCircle2 },
  Confirmed: { status: 'out_for_delivery', label: 'Dispatch', icon: Clock3 },
  'Out for Delivery': { status: 'delivered', label: 'Mark delivered', icon: PackageCheck },
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const rows = orders.flatMap((order) => order.items.map((item) => ({ id: `${order.id}-${item.id}`, order, item })));

  useEffect(() => {
    api.orders.list()
      .then(({ orders: savedOrders }) => setOrders(savedOrders))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (order) => {
    const transition = nextOrderStatus[order.status];
    if (!transition) return;
    try {
      const { order: updatedOrder } = await api.orders.updateStatus(order.id, transition.status);
      setOrders((current) => current.map((entry) => entry.id === order.id ? updatedOrder : entry));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Orders</p>
        <h1 className="text-3xl font-bold text-slate-900">Order management</h1>
        <p className="mt-1 text-sm text-slate-500">Orders containing products sold by your pharmacy.</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {loading ? (
        <p role="status" className="rounded-2xl bg-white p-8 text-center text-sm text-slate-600">Loading orders…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-4 py-3">Order / item</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Delivery</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {rows.map(({ id, order, item }) => {
                  const transition = nextOrderStatus[order.status];
                  const Icon = transition?.icon;
                  return (
                    <tr key={id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{order.id}</p>
                        <p className="text-xs text-slate-500">{item.name} · Qty {item.quantity}</p>
                      </td>
                      <td className="px-4 py-3">{order.customer}</td>
                      <td className="px-4 py-3">{[order.address?.street, order.address?.city].filter(Boolean).join(', ')}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-800">{order.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {transition && (
                          <button type="button" onClick={() => updateStatus(order)} className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-2.5 py-1.5 text-[10px] font-semibold text-white">
                            <Icon className="h-3 w-3" /> {transition.label}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">৳{item.quantity * item.price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && (
              <div className="p-8 text-center">
                <p className="font-semibold text-slate-900">No orders for this pharmacy yet</p>
                <p className="mt-1 text-sm text-slate-500">Orders that contain your products will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
