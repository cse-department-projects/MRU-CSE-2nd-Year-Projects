import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../ui/Spinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to the correct dashboard
    const dashboardMap = { ADMIN: '/admin', DOCTOR: '/doctor', PATIENT: '/patient' };
    return <Navigate to={dashboardMap[user?.role] || '/login'} replace />;
  }

  return children;
}
