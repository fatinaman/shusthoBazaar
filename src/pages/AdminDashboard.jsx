import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users } from 'lucide-react';
import { useAuth } from '../context/authState';
import { useNavigate } from 'react-router-dom';

const links = [
  { label: 'Seller overview', detail: 'View marketplace activity and seller metrics.', to: '/seller/dashboard', icon: LayoutDashboard },
  { label: 'Product catalogue', detail: 'Review and maintain the demo medicine inventory.', to: '/seller/products', icon: Package },
  { label: 'Order operations', detail: 'Review incoming customer orders and their status.', to: '/seller/orders', icon: ShoppingCart },
];

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-12 w-9 object-contain" />
            <span className="text-xl font-extrabold tracking-tight text-teal-900">shusthoBazaar</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Platform administration</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin workspace</h1>
        <p className="mt-1 text-sm text-slate-500">Signed in as {user.name}</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Explore the separate seller demo tools from one place. This prototype uses local browser storage and has no real user accounts.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {links.map(({ label, detail, to, icon: Icon }) => (
            <Link key={to} to={to} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-bold text-slate-900">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-900"><Users className="h-4 w-4 text-teal-700" /> Demo operations</div>
          <p className="mt-2">Customer checkout, address management, prescription review, and sandbox payments are simulated for product showcasing.</p>
        </div>
      </div>
    </main>
  );
}
