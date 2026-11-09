import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authState';

const homeByRole = {
  customer: '/',
  seller: '/seller/dashboard',
  admin: '/admin',
};

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeByRole[user.role]} replace />;
  }

  return children;
}
