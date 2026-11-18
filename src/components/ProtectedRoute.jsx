import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ managerOnly = false }) {
  const { isAuthenticated, isManager } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (managerOnly && !isManager) return <Navigate to="/projects" replace />;
  return <Outlet />;
}
