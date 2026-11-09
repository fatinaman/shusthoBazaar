import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { demoAccounts } from '../data/demoAccounts';
import { useAuth } from '../context/authState';

const landingByRole = {
  customer: '/',
  seller: '/seller/dashboard',
  admin: '/admin',
};

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to={landingByRole[user.role]} replace />;

  const fillAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(email, password);
    if (!result.success) {
      setError(result.error);
      return;
    }

    const requestedPath = location.state?.from?.pathname;
    navigate(requestedPath || landingByRole[result.user.role], { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-700 p-8 text-white md:p-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-50 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to marketplace
          </Link>
          <div className="mt-12 flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-14 w-11 object-contain" />
            <span className="text-2xl font-extrabold tracking-tight text-white">shusthoBazaar</span>
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Welcome to ShusthoBazaar</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-teal-50">
            Sign in to manage orders, save delivery addresses, and explore the role-specific demo experiences.
          </p>
          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-teal-50">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            Showcase mode only. No production authentication or real payments.
          </div>
        </section>

        <section className="p-8 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Demo sign in</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label>
              <input
                autoComplete="username"
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
              <input
                autoComplete="current-password"
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                placeholder="Enter your password"
              />
            </div>
            {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800">
              Sign in
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Quick-fill demo accounts</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {demoAccounts.map((account) => (
                <button
                  type="button"
                  key={account.id}
                  onClick={() => fillAccount(account)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-semibold capitalize text-slate-700 transition hover:border-teal-500 hover:bg-teal-50"
                >
                  {account.role} account
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Public demo credentials are listed in <code>src/data/demoAccounts.js</code>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
