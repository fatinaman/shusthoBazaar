import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, TrendingUp, ShoppingBag, Filter } from 'lucide-react';

export default function AnalyticsReports() {
  const [data, setData] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState('');

  useEffect(() => {
    fetch('/api/seller/stores', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setStores(d.sellers || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const qs = selectedSeller ? `?sellerId=${selectedSeller}` : '';
    fetch(`/api/analytics/overview${qs}`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [selectedSeller]);

  const maxFunnel = data?.funnel?.[0]?.count || 1;
  const exportHref = `/api/analytics/export/csv${selectedSeller ? `?sellerId=${selectedSeller}` : ''}`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Admin Workspace
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Analytics & Performance Reports</h1>
            <p className="text-sm text-slate-500">Sales metrics, conversion funnel, and downloadable reports</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              <option value="">All Pharmacies (Platform-wide)</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.storeName}</option>
              ))}
            </select>

            <a
              href={exportHref}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Download className="h-4 w-4" /> Export CSV Report
            </a>
          </div>
        </div>

        {!data ? (
          <p className="mt-8 text-sm text-slate-500">Loading analytics...</p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-sm font-medium">Total Gross Revenue</span>
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">৳{data.totalRevenue.toLocaleString()}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-sm font-medium">Total Orders Processed</span>
                  <ShoppingBag className="h-5 w-5 text-teal-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{data.totalOrders}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-sm font-medium">Checkout Conversion Rate</span>
                  <Filter className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {data.funnel?.[0]?.count
                    ? `${Math.round(((data.funnel[3]?.count || 0) / data.funnel[0].count) * 100)}%`
                    : '0%'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-slate-900">Customer Conversion Funnel</h2>
                <p className="text-xs text-slate-500">Drop-off from product view to completed payment</p>
                <div className="mt-5 space-y-4">
                  {data.funnel.map((step) => {
                    const pct = Math.max(8, Math.round((step.count / maxFunnel) * 100));
                    return (
                      <div key={step.stage}>
                        <div className="flex justify-between text-sm font-medium text-slate-700">
                          <span>{step.stage}</span>
                          <span>{step.count} events</span>
                        </div>
                        <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-slate-900">Daily Order Revenue</h2>
                <p className="text-xs text-slate-500">Recent order volume by date</p>
                {data.dailySales.length === 0 ? (
                  <p className="mt-6 text-sm text-slate-500">No placed orders recorded yet.</p>
                ) : (
                  <div className="mt-4 divide-y divide-slate-100">
                    {data.dailySales.map((day) => (
                      <div key={day.date} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="font-medium text-slate-700">{day.date}</span>
                        <span className="text-slate-500">{day.orders} orders</span>
                        <span className="font-bold text-teal-800">৳{day.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Top Selling Medicines</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 font-semibold">Medicine</th>
                      <th className="pb-3 font-semibold">Pharmacy</th>
                      <th className="pb-3 font-semibold">Units Sold</th>
                      <th className="pb-3 font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.topProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 font-medium text-slate-900">{p.name}</td>
                        <td className="py-3 text-slate-600">{p.pharmacyName}</td>
                        <td className="py-3 text-slate-700">{p.unitsSold}</td>
                        <td className="py-3 font-bold text-slate-900">৳{p.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}