import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, PackageCheck } from 'lucide-react';
import { useAuth } from '../../context/authState';
import { getDemoOrders } from '../../data/orders';

function getStatusStyle(status) {
  if (status === 'Delivered') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Rejected') return 'bg-rose-100 text-rose-700';
  if (status === 'Out for Delivery') return 'bg-sky-100 text-sky-700';
  if (status === 'Confirmed') return 'bg-teal-100 text-teal-700';
  return 'bg-amber-100 text-amber-700';
}

export default function OrderHistory() {
  const { user } = useAuth();
  const orders = getDemoOrders()
    .filter((order) => user.role === 'admin' || order.customerEmail === user.email)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Your account</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">My orders</h1>
        <p className="mt-2 text-sm text-slate-600">View order updates, follow delivery progress, and open your invoices.</p>
      </div>

      {orders.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-xs">
          <ClipboardList className="mx-auto h-12 w-12 text-teal-700" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">No orders yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            After you place an order, its tracking progress and invoice will be available here.
          </p>
          <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">
            Browse medicines <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = order.status || order.orderStatus || 'Placed';
            const itemSummary = (order.items || []).slice(0, 2).map((item) => `${item.name} × ${item.quantity}`).join(', ');
            const extraItems = Math.max((order.items || []).length - 2, 0);

            return (
              <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-900">Order {order.id}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(status)}`}>{status}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Placed {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'date unavailable'}
                    </p>
                    <p className="mt-3 text-sm text-slate-700">
                      {itemSummary || 'Order items'}{extraItems > 0 ? `, +${extraItems} more` : ''}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.paymentMethod || 'Payment method unavailable'} · {order.paymentStatus || 'Payment status unavailable'}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-slate-500">Order total</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">৳{order.total}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                  <Link to={`/orders/${order.id}`} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                    <PackageCheck className="h-4 w-4" /> Track order
                  </Link>
                  <Link to={`/orders/${order.id}/invoice`} className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    View invoice
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
