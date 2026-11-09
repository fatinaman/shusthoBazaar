import { ArrowUpRight, PackageCheck, ShoppingCart, TrendingUp, Wallet, Boxes } from 'lucide-react';

const metrics = [
  { label: 'Total sales', value: '৳ 1,24,500', change: '+18.2%', icon: Wallet },
  { label: 'Total orders', value: '386', change: '+12.5%', icon: ShoppingCart },
  { label: 'Pending orders', value: '24', change: '-6.8%', icon: PackageCheck },
  { label: 'Low stock', value: '07', change: '+3 items', icon: Boxes },
];

const recentOrders = [
  { id: 'SB-78101', customer: 'Nusrat Jahan', product: 'Napa Extra', status: 'Confirmed', amount: '৳ 1,040' },
  { id: 'SB-78102', customer: 'Mahmud Hasan', product: 'Seclo 20mg', status: 'Processing', amount: '৳ 650' },
  { id: 'SB-78103', customer: 'Sadia Ahmed', product: 'Monas 10mg', status: 'Awaiting Rx', amount: '৳ 1,620' },
];

const inventory = [
  { label: 'Napa Extra', count: 150 },
  { label: 'Seclo 20mg', count: 82 },
  { label: 'Monas 10mg', count: 41 },
  { label: 'Sergel 20mg', count: 119 },
];

export default function SellerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Overview</p>
          <h1 className="text-3xl font-bold text-slate-900">Seller dashboard</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">
          <TrendingUp className="h-4 w-4" /> Export report
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-5 text-3xl font-bold text-slate-900">{value}</p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" /> {change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Sales overview</p>
              <h2 className="text-xl font-bold text-slate-900">This month</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">+22.4%</span>
          </div>

          <div className="mt-6 flex h-40 items-end gap-3">
            {[32, 46, 38, 58, 72, 64, 88].map((height, index) => (
              <div key={index} className="flex-1">
                <div className="rounded-t-2xl bg-gradient-to-t from-teal-700 to-teal-400" style={{ height: `${height}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <p className="text-sm text-slate-500">Inventory summary</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Low stock alerts</h2>
          <div className="mt-5 space-y-4">
            {inventory.map((item) => (
              <div key={item.label} className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  <span className="text-slate-500">{item.count} units</span>
                </div>
                <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.max((item.count / 180) * 100, 20)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Recent orders</p>
            <h2 className="text-xl font-bold text-slate-900">Incoming activity</h2>
          </div>
          <button className="text-sm font-semibold text-teal-700">View all</button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-slate-400">
                <th className="pb-3 pr-4">Order</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 pr-4 font-semibold text-slate-900">{order.id}</td>
                  <td className="py-3 pr-4">{order.customer}</td>
                  <td className="py-3 pr-4">{order.product}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      order.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : order.status === 'Processing'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-slate-900">{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
