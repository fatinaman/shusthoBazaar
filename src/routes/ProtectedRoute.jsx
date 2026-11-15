import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authState';

const homeByRole = {
  customer: '/',
  seller: '/seller/dashboard',
  admin: '/admin',
};

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-600" role="status">Loading your account…</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeByRole[user.role]} replace />;
  }

  return children;
}
