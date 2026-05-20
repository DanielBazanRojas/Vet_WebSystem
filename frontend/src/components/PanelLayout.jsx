import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import NotificationsPanel from '../modules/notifications/NotificationsPanel';

export default function PanelLayout() {
  const { user, logout, can } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', show: true },
    { name: 'Clientes', path: '/clientes', show: can('clients', 'read') },
    { name: 'Mascotas', path: '/mascotas', show: can('pets', 'read') },
    { name: 'Citas', path: '/citas', show: can('appointments', 'read') },
    { name: 'Consultas', path: '/consultas', show: can('consultations', 'read') },
    { name: 'Farmacia', path: '/farmacia', show: can('inventory', 'read') },
    { name: 'Estética', path: '/estetica', show: can('grooming', 'read') },
    { name: 'Facturación', path: '/facturacion', show: can('invoices', 'read') },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-slate-700">
          Vet Pets David
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map((item, idx) => item.show && (
              <li key={idx}>
                <Link to={item.path} className="block px-4 py-2 hover:bg-slate-700 transition">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Panel de Administración</h1>
          <div className="flex items-center space-x-6">
            <NotificationsPanel />
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Hola, {user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
