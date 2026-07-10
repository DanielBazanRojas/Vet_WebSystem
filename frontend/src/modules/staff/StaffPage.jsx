import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { useStaffList, useToggleStaff } from './useStaff';
import StaffForm from './StaffForm';
import ResetPasswordModal from './ResetPasswordModal';
import toast from 'react-hot-toast';
import { Edit, UserPlus, Key, UserCheck, UserX, Search, ShieldAlert } from 'lucide-react';

export default function StaffPage() {
  const { can } = useAuthStore();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  const [resetPasswordStaff, setResetPasswordStaff] = useState(null);

  const toggleMutation = useToggleStaff();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Page authorization check
  if (!can('usuarios', 'ver')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-bold">Acceso Denegado</h3>
          <p className="text-sm">No tiene los permisos necesarios para ver esta sección de administración de personal.</p>
        </div>
      </div>
    );
  }

  const { data, isLoading, isError, refetch } = useStaffList({
    search: debouncedSearch,
    page,
    limit: 10
  });

  const handleToggleActive = async (staff) => {
    const actionText = staff.is_active ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de que deseas ${actionText} la cuenta de ${staff.full_name}?`)) {
      return;
    }

    try {
      await toggleMutation.mutateAsync(staff.id);
      toast.success(`Cuenta de ${staff.full_name} ${staff.is_active ? 'desactivada' : 'activada'} correctamente`);
    } catch (error) {
      toast.error('Error al cambiar el estado del usuario');
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setIsFormOpen(true);
  };

  // Get color badges for different staff roles
  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'veterinario':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Veterinario
          </span>
        );
      case 'groomer':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800 border border-pink-200">
            Groomer
          </span>
        );
      case 'recepcionista':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Recepcionista
          </span>
        );
      case 'admin':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
            Administrador
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {roleName || 'Sin Rol'}
          </span>
        );
    }
  };

  // Status badge coloring
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
        Activo
      </span>
    ) : (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        Inactivo
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Personal</h1>
          <p className="text-sm text-slate-500">Administra los usuarios del sistema, sus roles, estados y accesos.</p>
        </div>
        {can('usuarios', 'crear') && (
          <button 
            onClick={handleAddNew} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-semibold shadow-sm"
          >
            <UserPlus className="w-4.5 h-4.5" /> Nuevo Usuario
          </button>
        )}
      </div>

      <div className="flex items-center bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm w-full md:w-1/3">
        <Search className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          className="w-full text-sm outline-none bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-gray-50 md:bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Nombre</th>
                <th className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Email</th>
                <th className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Teléfono</th>
                <th className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Rol Asignado</th>
                <th className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Estado</th>
                <th className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-slate-100">
              {isLoading ? (
                <tr className="block md:table-row">
                  <td colSpan="6" className="p-8 text-center text-slate-500 block md:table-cell">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr className="block md:table-row">
                  <td colSpan="6" className="p-8 text-center text-red-500 font-medium block md:table-cell">Error al cargar el personal del sistema</td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr className="block md:table-row">
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium block md:table-cell">No se encontraron resultados</td>
                </tr>
              ) : (
                data?.data?.map(staff => (
                  <tr key={staff.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-slate-50 transition block md:table-row md:bg-transparent md:rounded-none md:border-0 md:shadow-none py-5 md:py-0 space-y-2 md:space-y-0 mb-4 md:mb-0">
                    <td className="px-5 py-3 text-sm font-semibold text-slate-800 block md:table-cell flex justify-between items-center border-b border-gray-100 md:p-4 md:border-b-0">
                      <span className="md:hidden font-semibold text-slate-500">Nombre:</span>
                      <span>{staff.full_name}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 block md:table-cell flex justify-between items-center border-b border-gray-100 md:p-4 md:border-b-0">
                      <span className="md:hidden font-semibold text-slate-500">Email:</span>
                      <span>{staff.email}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 block md:table-cell flex justify-between items-center border-b border-gray-100 md:p-4 md:border-b-0">
                      <span className="md:hidden font-semibold text-slate-500">Teléfono:</span>
                      <span>{staff.phone || '-'}</span>
                    </td>
                    <td className="px-5 py-3 text-sm block md:table-cell flex justify-between items-center border-b border-gray-100 md:p-4 md:border-b-0">
                      <span className="md:hidden font-semibold text-slate-500">Rol Asignado:</span>
                      <span>{getRoleBadge(staff.role_name)}</span>
                    </td>
                    <td className="px-5 py-3 text-sm block md:table-cell flex justify-between items-center md:p-4">
                      <span className="md:hidden font-semibold text-slate-500">Estado:</span>
                      <span>{getStatusBadge(staff.is_active)}</span>
                    </td>
                    <td className="p-4 text-sm text-right space-x-2 block md:table-cell flex justify-between md:justify-end items-center border-t border-gray-200 pt-3 mt-2 md:border-t-0 md:pt-0 md:mt-0">
                      <span className="md:hidden font-semibold text-slate-500">Acciones:</span>
                      <div className="space-x-2 flex items-center">
                        {can('usuarios', 'editar') && (
                          <button 
                            onClick={() => handleEdit(staff)} 
                            title="Editar usuario"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-800 rounded-lg transition inline-flex items-center justify-center border border-transparent hover:border-blue-100"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {can('usuarios', 'editar') && (
                          <button 
                            onClick={() => setResetPasswordStaff(staff)} 
                            title="Restablecer contraseña"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition inline-flex items-center justify-center border border-transparent hover:border-amber-100"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        )}
                        {can('usuarios', 'eliminar') && staff.role_name !== 'admin' && (
                          <button 
                            onClick={() => handleToggleActive(staff)} 
                            title={staff.is_active ? "Desactivar cuenta" : "Activar cuenta"}
                            className={`p-1.5 rounded-lg transition inline-flex items-center justify-center border border-transparent ${
                              staff.is_active 
                                ? 'text-red-600 hover:bg-red-50 hover:text-red-800 hover:border-red-100' 
                                : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-100'
                            }`}
                          >
                            {staff.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && data?.totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando página {data.page} de {data.totalPages} (Total: {data.total} registros)
            </span>
            <div className="space-x-2 flex">
              <button 
                disabled={data.page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 text-xs border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-medium text-slate-600 transition"
              >
                Anterior
              </button>
              <button 
                disabled={data.page === data.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-medium text-slate-600 transition"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* StaffForm Modal */}
      {isFormOpen && (
        <StaffForm 
          initialData={editingStaff} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => refetch()} 
        />
      )}

      {/* ResetPasswordModal */}
      {resetPasswordStaff && (
        <ResetPasswordModal 
          staffId={resetPasswordStaff.id}
          staffName={resetPasswordStaff.full_name}
          onClose={() => setResetPasswordStaff(null)} 
        />
      )}
    </div>
  );
}
