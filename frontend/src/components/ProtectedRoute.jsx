import { Navigate } from 'react-router-dom';
import { useAuth, LoadingScreen } from '../context/AuthContext';

export default function ProtectedRoute({ children, feature }) {
  const { user, hasAccess, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (feature && !hasAccess(feature)) return <Navigate to="/" replace />;

  return children;
}
