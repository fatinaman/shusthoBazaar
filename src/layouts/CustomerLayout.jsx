import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Search, 
  ShoppingBag, 
  User, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Store, 
  Activity, 
  Truck 
} from 'lucide-react';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Utility Announcement Bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>24/7 Verified Pharmacist Hotline:</span>
            <a href="tel:16247" className="text-teal-700 font-semibold hover:underline">16247</a>
            <span className="text-slate-300">•</span>
            <span>Express Medicine Dispatch in 90 Mins across Dhaka</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Delivering to: <strong className="text-slate-900">Dhaka / Gulshan-2</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
              SB
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">ShusthoBazaar</span>
              <span className="block text-[10px] text-teal-700 font-semibold uppercase tracking-wider">Verified Pharmacy Network</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input 
                type="search" 
                placeholder="Search medicine, generic name, symptoms, or doctor..." 
                className="w-full h-11 pl-10 pr-14 rounded-lg bg-slate-50 text-slate-900 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <span className="absolute right-3 bg-slate-200 text-slate-600 font-mono text-[10px] px-1.5 py-0.5 rounded">Ctrl+K</span>
            </div>
          </div>

          {/* Actions: Cart & Profile */}
          <div className="flex items-center gap-4 shrink-0">
            <Link to="/cart" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-slate-700" />
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  3
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] text-slate-500 uppercase leading-none">Cart</p>
                <p className="text-xs font-bold text-slate-900 leading-none mt-1">৳ 1,240</p>
              </div>
            </Link>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs ring-2 ring-teal-600/20">
                AI
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">Dr. Aminul Islam</p>
                <p className="text-[10px] text-slate-500 leading-none mt-1">Prime Health</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar Links */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-1 py-2 overflow-x-auto text-sm">
              <NavLink to="/" className={({isActive}) => `px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                Medicines
              </NavLink>
              <NavLink to="/products" className={({isActive}) => `px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                Product Catalog
              </NavLink>
              <NavLink to="/cart" className={({isActive}) => `px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                Cart
              </NavLink>
              <NavLink to="/checkout" className={({isActive}) => `px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                Checkout
              </NavLink>
              <NavLink to="/orders/ord-89241" className={({isActive}) => `px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                Order Tracking
              </NavLink>
              <NavLink to="/seller/dashboard" className="ml-auto px-3.5 py-1.5 rounded-lg bg-teal-700 text-white font-medium hover:bg-teal-800 transition-colors whitespace-nowrap">
                Switch to Seller Center →
              </NavLink>
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
                <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-sm">SB</div>
                <span className="font-bold text-slate-900 text-lg">ShusthoBazaar</span>
              </div>
              <p className="text-slate-600 text-sm max-w-sm">
                Bangladesh&apos;s digital medical infrastructure connecting registered pharmacies, verified specialist doctors, and cold-chain door-to-door delivery.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 text-xs rounded-full font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> DGDA Licensed Pharmacy Portal
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-slate-900 text-sm">Customer Services</h3>
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                <li><Link to="/products" className="hover:text-teal-700 transition-colors">Authentic OTC & Rx Medicines</Link></li>
                <li><Link to="/cart" className="hover:text-teal-700 transition-colors">Shopping Cart & Refills</Link></li>
                <li><Link to="/checkout" className="hover:text-teal-700 transition-colors">Secure Checkout Flow</Link></li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-slate-900 text-sm">Seller & Partners</h3>
              <ul className="flex flex-col gap-space-xs text-sm text-slate-600">
                <li><Link to="/seller/dashboard" className="hover:text-teal-700 transition-colors">Seller Dashboard</Link></li>
                <li><Link to="/seller/products" className="hover:text-teal-700 transition-colors">Product Management</Link></li>
                <li><Link to="/seller/orders" className="hover:text-teal-700 transition-colors">Order Management</Link></li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-slate-900 text-sm">24/7 Clinical Support</h3>
              <p className="text-xs text-slate-600">Medical emergency or medicine inquiry? Registered clinical pharmacists are standing by.</p>
              <a href="tel:16247" className="text-teal-700 font-bold text-lg hover:underline">16247</a>
              <span className="text-xs text-slate-500">House 42, Road 11, Banani, Dhaka</span>
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