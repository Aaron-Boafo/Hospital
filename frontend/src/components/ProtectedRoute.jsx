import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, feature }) {
  const { user, hasAccess } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (feature && !hasAccess(feature)) return <Navigate to="/" replace />;

  return children;
}
