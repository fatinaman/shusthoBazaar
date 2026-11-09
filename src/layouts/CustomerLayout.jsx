import { useState } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/cartState";
import { MapPin, Search, ShoppingBag, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/authState";

export default function CustomerLayout() {
  const { totalItems, subtotal } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Utility Announcement Bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>24/7 Verified Pharmacist Hotline:</span>
            <a
              href="tel:16247"
              className="text-teal-700 font-semibold hover:underline"
            >
              16247
            </a>
            <span className="text-slate-300">•</span>
            <span>Express Medicine Dispatch in 90 Mins across Dhaka</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>
                Delivering to:{" "}
                <strong className="text-slate-900">Dhaka / Gulshan-2</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src="/logo.png" alt="" className="h-11 w-9 object-contain" />
            <span className="text-lg font-extrabold tracking-tight text-teal-900">shusthoBazaar</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={submitSearch} className="mx-4 hidden max-w-xl flex-1 items-center md:flex">
            <div className="relative flex w-full items-center">
              <Search className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="search"
                placeholder="Search medicine, generic name, symptoms, or doctor..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full h-11 pl-10 pr-14 rounded-lg bg-slate-50 text-slate-900 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <button type="submit" className="absolute right-2 rounded-md bg-teal-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800">Search</button>
            </div>
          </form>

          {/* Actions: Cart & Profile */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/cart"
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-slate-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] text-slate-500 uppercase leading-none">
                  Cart
                </p>
                <p className="text-xs font-bold text-slate-900 leading-none mt-1">
                  ৳ {subtotal}
                </p>
              </div>
            </Link>

            <div className="h-8 w-px bg-slate-200"></div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-bold leading-none text-slate-900">{user.name}</p>
                  <p className="mt-1 text-[10px] capitalize leading-none text-slate-500">{user.role} demo account</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Bar Links */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-1 py-2 overflow-x-auto text-sm">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${isActive ? "bg-teal-50 text-teal-800 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`
                }
              >
                Medicines
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${isActive ? "bg-teal-50 text-teal-800 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`
                }
              >
                Product Catalog
              </NavLink>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${isActive ? "bg-teal-50 text-teal-800 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`
                }
              >
                Cart
              </NavLink>
              <NavLink
                to="/checkout"
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${isActive ? "bg-teal-50 text-teal-800 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`
                }
              >
                Checkout
              </NavLink>
              {user && (
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${isActive ? "bg-teal-50 text-teal-800 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`
                  }
                >
                  My Orders
                </NavLink>
              )}
              {user?.role === 'seller' && (
                <NavLink to="/seller/dashboard" className="ml-auto whitespace-nowrap rounded-lg bg-teal-700 px-3.5 py-1.5 font-medium text-white hover:bg-teal-800">
                  Seller Center →
                </NavLink>
              )}
              {user?.role === 'admin' && (
                <NavLink to="/admin" className="ml-auto whitespace-nowrap rounded-lg bg-teal-700 px-3.5 py-1.5 font-medium text-white hover:bg-teal-800">
                  Admin Workspace →
                </NavLink>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Dynamic Page Content Renders Here via Outlet */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-100">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="" className="h-10 w-8 object-contain" />
                <span className="text-lg font-extrabold tracking-tight text-teal-900">shusthoBazaar</span>
              </div>
              <p className="text-slate-600 text-sm max-w-sm">
                Bangladesh&apos;s digital medical infrastructure connecting
                registered pharmacies, verified specialist doctors, and
                cold-chain door-to-door delivery.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 text-xs rounded-full font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> DGDA Licensed Pharmacy
                  Portal
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Customer Services
              </h3>
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                <li>
                  <Link
                    to="/products"
                    className="hover:text-teal-700 transition-colors"
                  >
                    Authentic OTC & Rx Medicines
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className="hover:text-teal-700 transition-colors"
                  >
                    Shopping Cart & Refills
                  </Link>
                </li>
                <li>
                  <Link
                    to="/checkout"
                    className="hover:text-teal-700 transition-colors"
                  >
                    Secure Checkout Flow
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orders"
                    className="hover:text-teal-700 transition-colors"
                  >
                    My Orders & Tracking
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Seller & Partners
              </h3>
              <ul className="flex flex-col gap-space-xs text-sm text-slate-600">
                <li>
                  <Link
                    to="/seller/dashboard"
                    className="hover:text-teal-700 transition-colors"
                  >
                    Seller Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/seller/products"
                    className="hover:text-teal-700 transition-colors"
                  >
                    Product Management
                  </Link>
                </li>
                <li>
                  <Link
                    to="/seller/orders"
                    className="hover:text-teal-700 transition-colors"
                  >
                    Order Management
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-slate-900 text-sm">
                24/7 Clinical Support
              </h3>
              <p className="text-xs text-slate-600">
                Medical emergency or medicine inquiry? Registered clinical
                pharmacists are standing by.
              </p>
              <a
                href="tel:16247"
                className="text-teal-700 font-bold text-lg hover:underline"
              >
                16247
              </a>
              <span className="text-xs text-slate-500">
                House 42, Road 11, Banani, Dhaka
              </span>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>DGDA Registration No: DC-DH-2023-8841</p>
            <p>© 2026 ShusthoBazaar Healthcare Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
