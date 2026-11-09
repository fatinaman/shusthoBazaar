import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileCheck, 
  LogOut, 
  Bell, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/authState';

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex antialiased">
      {/* Fixed Operations Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col justify-between">
        <div className="flex flex-col">
          {/* Sidebar Brand Header */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <img src="/logo.png" alt="" className="h-10 w-8 object-contain" />
            <div>
              <span className="block font-extrabold text-slate-900 tracking-tight text-sm">shusthoBazaar</span>
              <span className="block text-[10px] text-teal-700 font-semibold">Seller Console</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4">
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Console Navigation</p>
            <nav className="flex flex-col gap-1 text-sm font-medium">
              <NavLink 
                to="/seller/dashboard" 
                className={({isActive}) => `flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <LayoutDashboard className="w-5 h-5" /> Overview & Analytics
              </NavLink>
              <NavLink 
                to="/seller/products" 
                className={({isActive}) => `flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Package className="w-5 h-5" /> Product Management
              </NavLink>
              <NavLink 
                to="/seller/orders" 
                className={({isActive}) => `flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <ShoppingCart className="w-5 h-5" /> Order Management
              </NavLink>
              <NavLink 
                to="/seller/prescriptions" 
                className={({isActive}) => `flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <FileCheck className="w-5 h-5" /> Rx Verification Queue
              </NavLink>
            </nav>
          </div>
        </div>

        {/* User Profile Footer in Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.storeName || 'Platform administration'}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              title="Sign out"
              className="text-slate-400 transition-colors hover:text-slate-700"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area beside Sidebar */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Top Seller Header */}
        <header className="sticky top-0 left-64 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="h-2 w-2 rounded-full bg-teal-600"></span>
            <span>Active Pharmacy Node:</span>
            <strong className="text-slate-900">{user?.storeName || 'ShusthoBazaar Platform Admin'}</strong>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> Live Consumer Portal
            </Link>
            <div className="h-5 w-px bg-slate-200"></div>
            <button className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-600 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Seller Page Content via Outlet */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}