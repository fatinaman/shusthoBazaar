import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useAuth } from '../../context/authState';
import { getDemoOrders, updateDemoOrderStatus } from '../../data/orders';

const sampleOrders = [
  {
    id: 'SB-78101',
    customer: 'Nusrat Jahan',
    status: 'Pending',
    address: 'Banani, Dhaka',
    items: [{ id: 'sample-napa', name: 'Napa Extra', quantity: 2, price: 35, sellerId: 's001', requiresPrescription: false }],
    total: 130,
    paymentStatus: 'Pending',
  },
  {
    id: 'SB-78102',
    customer: 'Mahmud Hasan',
    status: 'Confirmed',
    address: 'Dhanmondi, Dhaka',
    items: [{ id: 'sample-seclo', name: 'Seclo 20mg', quantity: 3, price: 70, sellerId: 's002', requiresPrescription: true }],
    total: 270,
    paymentStatus: 'Pending',
  },
  {
    id: 'SB-78103',
    customer: 'Sadia Ahmed',
    status: 'Out for Delivery',
    address: 'Gulshan, Dhaka',
    items: [{ id: 'sample-monas', name: 'Monas 10mg', quantity: 4, price: 160, sellerId: 's003', requiresPrescription: true }],
    total: 700,
    paymentStatus: 'Paid (sandbox)',
  },
];

export default function OrderManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(getDemoOrders);
  const [sampleState, setSampleState] = useState(sampleOrders);
  const savedOrdersExist = orders.length > 0;
  const rows = (savedOrdersExist ? orders : sampleState).flatMap((order) =>
    (order.items || []).filter((item) =>
      user.role === 'admin' || item.sellerId === user.sellerId,
    ).map((item) => ({
      id: `${order.id}-${item.id}`,
      order,
      item,
    })),
  );

  const updateStatus = (orderId, status) => {
    const updatedOrder = updateDemoOrderStatus(orderId, status);
    if (updatedOrder) {
      setOrders(getDemoOrders());
      return;
    }

    setSampleState((current) => current.map((order) =>
      order.id === orderId ? { ...order, status, orderStatus: status } : order,
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Orders</p>
        <h1 className="text-3xl font-bold text-slate-900">Order management</h1>
        <p className="mt-1 text-sm text-slate-500">
          {savedOrdersExist ? 'Showing saved customer orders for your pharmacy.' : 'Showing sample orders until a customer places a demo order.'}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-slate-400">
                <th className="px-4 py-3">Order / item</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Prescription</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
                <th className="px-4 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {rows.map(({ id, order, item }) => {
                const status = order.status || order.orderStatus || 'Placed';
                return (
                  <tr key={id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{order.id}</p>
                      <p className="text-xs text-slate-500">{item.name} · Qty {item.quantity}</p>
                    </td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3">{typeof order.address === 'string' ? order.address : [order.address?.street, order.address?.city].filter(Boolean).join(', ')}</td>
                    <td className="px-4 py-3">{item.requiresPrescription ? order.prescriptionName || 'Required' : 'Not required'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        status === 'Placed' || status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        status === 'Out for Delivery' ? 'bg-sky-100 text-sky-700' :
                        status === 'Delivered' ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => updateStatus(order.id, 'Confirmed')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-semibold text-white">
                          <CheckCircle2 className="h-3 w-3" /> Accept
                        </button>
                        <button type="button" onClick={() => updateStatus(order.id, 'Out for Delivery')} className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-[10px] font-semibold text-white">
                          <Clock3 className="h-3 w-3" /> Dispatch
                        </button>
                        <button type="button" onClick={() => updateStatus(order.id, 'Rejected')} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-[10px] font-semibold text-white">
                          <XCircle className="h-3 w-3" /> Reject
                        </button>
                      </div>
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
              <Link to="/seller/products" className="mt-4 inline-flex text-sm font-semibold text-teal-700">View your products</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
