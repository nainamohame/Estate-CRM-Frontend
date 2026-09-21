import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { LoadingState } from '../components/patterns/EmptyState';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Loading Estate CRM…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/** Renders a Forbidden page rather than redirecting, to make role handling visible. */
export function RoleRoute({ role }) {
  const { user } = useAuth();
  if (user && user.role !== role) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
