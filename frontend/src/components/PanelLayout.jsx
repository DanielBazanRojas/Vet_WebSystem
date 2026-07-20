import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Calendar,
  Stethoscope,
  Pill,
  Sparkles,
  FileText,
  UserCog,
  Headphones,
  MessageSquare,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import NotificationsPanel from '../modules/notifications/NotificationsPanel';

const ROLE_LABELS = {
  admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
  veterinario: { label: 'Veterinario', color: 'bg-emerald-100 text-emerald-700' },
  groomer: { label: 'Estilista', color: 'bg-pink-100 text-pink-700' },
  recepcionista: { label: 'Recepcionista', color: 'bg-blue-100 text-blue-700' },
};

const PANEL_TITLE = {
  admin: 'Panel de Administración',
  veterinario: 'Panel Veterinario',
  groomer: 'Panel de Estética',
  recepcionista: 'Panel de Recepción',
};

export default function PanelLayout() {
  const { user, logout, can } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const role = user?.user_type || 'admin';
  const roleInfo = ROLE_LABELS[role] || { label: role, color: 'bg-slate-100 text-slate-700' };
  const panelTitle = PANEL_TITLE[role] || 'Panel del Sistema';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', show: true, icon: 'dashboard' },
    { name: 'Clientes', path: '/clientes', show: can('clients', 'read'), icon: 'users' },
    { name: 'Mascotas', path: '/mascotas', show: can('pets', 'read'), icon: 'paw' },
    { name: 'Citas', path: '/citas', show: can('appointments', 'read'), icon: 'calendar' },
    { name: 'Consultas', path: '/consultas', show: can('consultations', 'read'), icon: 'stethoscope' },
    { name: 'Farmacia', path: '/farmacia', show: can('inventory', 'read'), icon: 'pill' },
    { name: 'Estética', path: '/estetica', show: can('grooming', 'read'), icon: 'sparkles' },
    { name: 'Facturación', path: '/facturacion', show: can('invoices', 'read'), icon: 'fileText' },
    { name: 'Personal', path: '/personal', show: can('usuarios', 'ver'), icon: 'userCog' },
    { name: 'Soporte', path: '/soporte', show: true, icon: 'headphones' },
    { name: 'Feedback', path: '/feedback', show: true, icon: 'messageSquare' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-800 text-white flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 text-xl font-bold border-b border-slate-700 flex justify-between items-center">
          <span>Vet Pets David</span>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-1 hover:bg-slate-700 rounded text-slate-400"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map((item, idx) => item.show && (
              <li key={idx}>
                <Link 
                  to={item.path} 
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 transition"
                >
                  {item.icon === 'dashboard' && <LayoutDashboard className="w-4 h-4" />}
                  {item.icon === 'users' && <Users className="w-4 h-4" />}
                  {item.icon === 'paw' && <PawPrint className="w-4 h-4" />}
                  {item.icon === 'calendar' && <Calendar className="w-4 h-4" />}
                  {item.icon === 'stethoscope' && <Stethoscope className="w-4 h-4" />}
                  {item.icon === 'pill' && <Pill className="w-4 h-4" />}
                  {item.icon === 'sparkles' && <Sparkles className="w-4 h-4" />}
                  {item.icon === 'fileText' && <FileText className="w-4 h-4" />}
                  {item.icon === 'userCog' && <UserCog className="w-4 h-4" />}
                  {item.icon === 'headphones' && <Headphones className="w-4 h-4" />}
                  {item.icon === 'messageSquare' && <MessageSquare className="w-4 h-4" />}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-white border-b px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 -ml-2 rounded-md text-slate-600 hover:bg-slate-100 md:hidden flex items-center justify-center"
            >
              <span className="text-2xl leading-none">☰</span>
            </button>
            <h1 className="text-xl font-semibold text-slate-800 md:block hidden">{panelTitle}</h1>
            <h1 className="text-lg font-bold text-slate-800 md:hidden block">Vet Pets David</h1>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <NotificationsPanel />
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="text-right md:block hidden">
                <div className="text-sm font-medium text-slate-800">{user?.full_name}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs md:text-sm bg-red-50 text-red-600 px-2.5 md:px-3 py-1 rounded hover:bg-red-100 transition whitespace-nowrap"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
