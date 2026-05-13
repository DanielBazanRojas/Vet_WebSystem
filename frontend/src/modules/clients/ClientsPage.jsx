import { useState, useEffect } from 'react';
import { useClients, useDeleteClient } from './useClients';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import ClientForm from './ClientForm';
import { Link } from 'react-router-dom';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const can = useAuthStore(state => state.can);
  const deleteMutation = useDeleteClient();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isError } = useClients({ search: debouncedSearch, page, limit: 10 });

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Cliente eliminado');
      } catch (error) {
        toast.error('Error al eliminar cliente');
      }
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        {can('clients', 'write') && !isFormOpen && (
          <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            + Nuevo Cliente
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <ClientForm 
            initialData={editingClient} 
            onSuccess={() => setIsFormOpen(false)} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </div>
      ) : (
        <>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o teléfono..."
              className="w-full md:w-1/3 px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-slate-600 text-sm">Nombre</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">DNI</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">Teléfono</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">Email</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">Distrito</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
                          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-red-500">Error al cargar clientes</td>
                    </tr>
                  ) : data?.data?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">No se encontraron resultados</td>
                    </tr>
                  ) : (
                    data?.data?.map(client => (
                      <tr key={client.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-sm font-medium text-slate-800">
                          <Link to={`/clientes/${client.id}`} className="text-blue-600 hover:underline">
                            {client.full_name}
                          </Link>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{client.dni || '-'}</td>
                        <td className="p-4 text-sm text-slate-600">{client.phone}</td>
                        <td className="p-4 text-sm text-slate-600">{client.email || '-'}</td>
                        <td className="p-4 text-sm text-slate-600">{client.district || '-'}</td>
                        <td className="p-4 text-sm text-right space-x-3">
                          {can('clients', 'write') && (
                            <button onClick={() => handleEdit(client)} className="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                          )}
                          {can('clients', 'delete') && (
                            <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-800 font-medium">Eliminar</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {!isLoading && data?.totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
                <span className="text-sm text-slate-600">
                  Mostrando página {data.page} de {data.totalPages} (Total: {data.total})
                </span>
                <div className="space-x-2">
                  <button 
                    disabled={data.page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-slate-50"
                  >
                    Anterior
                  </button>
                  <button 
                    disabled={data.page === data.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-slate-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
