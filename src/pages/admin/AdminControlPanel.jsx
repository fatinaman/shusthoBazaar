import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AdminControlPanel() {
  const [tab, setTab] = useState('verifications');
  const [sellers, setSellers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [couponForm, setCouponForm] = useState({ code: '', discountType: 'percent', discountValue: 10, minOrderAmt: 100, validTo: '2026-12-31' });

  const loadAll = async () => {
    const [s, d, u, c, r, comp] = await Promise.all([
      fetch('/api/admin/sellers', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/admin/doctors', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/admin/users', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/admin/coupons', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/admin/reviews', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/admin/complaints', { credentials: 'include' }).then((res) => res.json()),
    ]);
    setSellers(s.sellers || []);
    setDoctors(d.doctors || []);
    setUsers(u.users || []);
    setCoupons(c.coupons || []);
    setReviews(r.reviews || []);
    setComplaints(comp.complaints || []);
  };

  useEffect(() => {
    loadAll().catch(console.error);
  }, []);

  const patchJson = async (url, body) => {
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    loadAll();
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(couponForm),
    });
    setCouponForm({ code: '', discountType: 'percent', discountValue: 10, minOrderAmt: 100, validTo: '2026-12-31' });
    loadAll();
  };

  const tabs = [
    { id: 'verifications', label: 'Seller & Doctor Verification' },
    { id: 'users', label: 'User Accounts' },
    { id: 'coupons', label: 'Coupons & Promos' },
    { id: 'moderation', label: 'Reviews & Complaints' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Admin Workspace
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Platform Governance & Verification</h1>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === t.id ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'verifications' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Pharmacy Verifications (Drug License & TIN)</h2>
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2">Pharmacy</th>
                    <th className="pb-2">Drug License</th>
                    <th className="pb-2">TIN</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellers.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 font-medium text-slate-900">{s.pharmacyName}</td>
                      <td className="py-3">{s.drugLicenseNo}</td>
                      <td className="py-3">{s.tinNumber || '—'}</td>
                      <td className="py-3 uppercase font-semibold text-xs">{s.status}</td>
                      <td className="py-3 space-x-2">
                        <button onClick={() => patchJson(`/api/admin/sellers/${s.id}/verify`, { status: 'approved' })} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Approve</button>
                        <button onClick={() => patchJson(`/api/admin/sellers/${s.id}/verify`, { status: 'rejected', reason: 'Invalid license' })} className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Doctor Credential Verifications (BMDC)</h2>
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2">Doctor</th>
                    <th className="pb-2">Specialty</th>
                    <th className="pb-2">BMDC Reg No</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map((d) => (
                    <tr key={d.id}>
                      <td className="py-3 font-medium text-slate-900">{d.fullName}</td>
                      <td className="py-3">{d.specialty}</td>
                      <td className="py-3">{d.bmdcRegNo}</td>
                      <td className="py-3 uppercase font-semibold text-xs">{d.status}</td>
                      <td className="py-3 space-x-2">
                        <button onClick={() => patchJson(`/api/admin/doctors/${d.id}/verify`, { status: 'approved' })} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Approve</button>
                        <button onClick={() => patchJson(`/api/admin/doctors/${d.id}/verify`, { status: 'rejected', reason: 'BMDC verification failed' })} className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">Registered Platform Users</h2>
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 font-medium">{u.fullName}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3 uppercase text-xs font-bold">{u.role}</td>
                    <td className="py-3">{u.isActive ? 'Active' : 'Suspended'}</td>
                    <td className="py-3">
                      <button
                        onClick={() => patchJson(`/api/admin/users/${u.id}/status`, { isActive: !u.isActive })}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold text-white ${u.isActive ? 'bg-rose-600' : 'bg-emerald-600'}`}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'coupons' && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">Promo Coupons</h2>
            <form onSubmit={handleCreateCoupon} className="mt-4 flex flex-wrap gap-3">
              <input placeholder="Code (e.g. EID20)" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (BDT)</option>
              </select>
              <input type="number" placeholder="Value" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })} required className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input type="number" placeholder="Min Order" value={couponForm.minOrderAmt} onChange={(e) => setCouponForm({ ...couponForm, minOrderAmt: Number(e.target.value) })} required className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input type="date" value={couponForm.validTo} onChange={(e) => setCouponForm({ ...couponForm, validTo: e.target.value })} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <button type="submit" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Create Coupon</button>
            </form>

            <table className="mt-6 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Discount</th>
                  <th className="pb-2">Min Order</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 font-bold">{c.code}</td>
                    <td className="py-3">{c.discountType === 'percent' ? `${c.discountValue}%` : `৳${c.discountValue}`}</td>
                    <td className="py-3">৳{c.minOrderAmt}</td>
                    <td className="py-3">{c.isActive ? 'Active' : 'Disabled'}</td>
                    <td className="py-3">
                      <button onClick={() => patchJson(`/api/admin/coupons/${c.id}/status`, { isActive: !c.isActive })} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold">
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'moderation' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Customer Complaints</h2>
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Pharmacy</th>
                    <th className="pb-2">Issue</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 font-medium">{c.customerName}</td>
                      <td className="py-3">{c.pharmacyName || 'General'}</td>
                      <td className="py-3"><strong>{c.subject}:</strong> {c.description}</td>
                      <td className="py-3 uppercase text-xs font-semibold">{c.status}</td>
                      <td className="py-3">
                        {c.status !== 'resolved' ? (
                          <button onClick={() => patchJson(`/api/admin/complaints/${c.id}/resolve`, { actionTaken: 'Resolved & seller notified' })} className="rounded-lg bg-teal-700 px-3 py-1 text-xs font-semibold text-white">
                            Mark Resolved
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">{c.adminActionTaken}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Marketplace Reviews</h2>
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2">Author</th>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Rating</th>
                    <th className="pb-2">Comment</th>
                    <th className="pb-2">Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 font-medium">{r.authorName}</td>
                      <td className="py-3">{r.productName}</td>
                      <td className="py-3">{r.rating} / 5</td>
                      <td className="py-3">{r.comment}</td>
                      <td className="py-3">
                        <button onClick={() => patchJson(`/api/admin/reviews/${r.id}/visibility`, { isVisible: !r.isVisible })} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold">
                          {r.isVisible ? 'Hide' : 'Unhide'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}