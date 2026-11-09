import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Clock3, ShieldCheck, Stethoscope, Truck } from 'lucide-react';
import ProductCard from '../../components/customer/ProductCard';
import { useProducts } from '../../context/productState';

const quickActions = [
  {
    title: 'Verified Medicines',
    description: 'OTC and physician-led prescriptions, all sourced from licensed partners.',
    icon: ShieldCheck,
  },
  {
    title: 'Same-Day Dispatch',
    description: 'Express delivery across Dhaka with temperature-safe handling.',
    icon: Truck,
  },
  {
    title: 'Pharmacist Support',
    description: 'Expert guidance for dosage, usage, and refill management.',
    icon: Stethoscope,
  },
];

export default function Home() {
  const { products } = useProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-700 p-8 md:p-10 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_40%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-100 border border-white/10">
              <BadgeCheck className="h-4 w-4" /> Trusted care, delivered fast
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight">
              Your trusted online medicine marketplace.
            </h1>
            <p className="mt-4 max-w-xl text-base text-teal-50 leading-7">
              Browse authentic medicines, compare trusted sellers, and get prescription support when you need it.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-800 shadow-sm hover:bg-slate-100 transition-colors">
                Shop medicines <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/checkout" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                Start checkout
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-sm p-5">
            <div className="grid gap-4">
              <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-teal-100">Today&apos;s dispatch</p>
                <p className="mt-2 text-3xl font-bold">312</p>
                <p className="mt-1 text-sm text-teal-100">orders processed in the last 24 hours</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.18em] text-teal-100">Avg. delivery</p>
                  <p className="mt-2 text-2xl font-bold">90 min</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.18em] text-teal-100">Guidance</p>
                  <p className="mt-2 text-2xl font-bold">24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {quickActions.map(({ title, description, icon: Icon }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 leading-6">{description}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Best sellers</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">Featured medicines</h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800">
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.filter((product) => product.isAvailable && product.stock > 0).slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Why people choose us</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">A smarter way to buy medicine online</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <Clock3 className="h-4 w-4" /> 1.2K+ verified prescriptions reviewed
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-slate-600">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <p className="font-bold text-slate-900">Prescription-ready</p>
            <p className="mt-2 leading-6">Upload and verify medications that require doctor approval before ordering.</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <p className="font-bold text-slate-900">Real-time order tracking</p>
            <p className="mt-2 leading-6">Follow every step from confirmation to delivery with transparent status updates.</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <p className="font-bold text-slate-900">Multi-vendor marketplace</p>
            <p className="mt-2 leading-6">Shop from multiple pharmacies and compare products, pricing, and availability.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
