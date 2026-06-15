import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * PermissionRoute - Protects a route based on a required permission.
 * If the user doesn't have the required permission, redirects to dashboard.
 * 
 * Usage: <PermissionRoute module="invoices" action="read" />
 */
export default function PermissionRoute({ module, action }) {
  const { can, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (!can(module, action)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
