import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function PrivateRoute() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
