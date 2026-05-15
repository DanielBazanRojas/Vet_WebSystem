import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePets, useSpecies, useDeletePet } from './usePets';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import PetForm from './PetForm';

export default function PetsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  const can = useAuthStore(s => s.can);
  const deleteMutation = useDeletePet();
  const { data: speciesList = [] } = useSpecies();

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = usePets({
    search: debouncedSearch || undefined,
    species_id: speciesFilter || undefined,
    page,
    limit: 12,
  });

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta mascota?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Mascota eliminada');
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Mascotas</h1>
        {can('pets', 'write') && !isFormOpen && (
          <button onClick={() => { setEditingPet(null); setIsFormOpen(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            + Nueva Mascota
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">{editingPet ? 'Editar Mascota' : 'Nueva Mascota'}</h2>
          <PetForm initialData={editingPet} onSuccess={() => setIsFormOpen(false)} onCancel={() => setIsFormOpen(false)} />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <input type="text" placeholder="Buscar por nombre..."
              className="px-4 py-2 border rounded-md shadow-sm w-full md:w-64"
              value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={speciesFilter} onChange={(e) => { setSpeciesFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border rounded-md shadow-sm bg-white w-full md:w-48">
              <option value="">Todas las especies</option>
              {speciesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                  <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center py-10">Error al cargar mascotas</div>
          ) : data?.data?.length === 0 ? (
            <div className="text-slate-500 text-center py-10 bg-white rounded-lg border border-dashed">No se encontraron mascotas</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data?.data?.map(pet => (
                <div key={pet.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition overflow-hidden">
                  <div className="p-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mx-auto mb-3 text-2xl">🐾</div>
                    <Link to={`/mascotas/${pet.id}`} className="block text-center">
                      <h3 className="font-bold text-slate-800 text-lg hover:text-blue-600 transition">{pet.name}</h3>
                    </Link>
                    <p className="text-sm text-slate-500 text-center">{pet.species_name}{pet.breed_name ? ` · ${pet.breed_name}` : ''}</p>
                    <p className="text-xs text-slate-400 text-center mt-1">
                      Dueño: <Link to={`/clientes/${pet.client_id}`} className="text-blue-500 hover:underline">{pet.client_name}</Link>
                    </p>
                    {pet.gender !== 'desconocido' && (
                      <div className="mt-2 flex justify-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${pet.gender === 'macho' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{pet.gender}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t flex divide-x text-center text-xs">
                    {can('pets', 'write') && (
                      <button onClick={() => { setEditingPet(pet); setIsFormOpen(true); }}
                              className="flex-1 py-2 text-blue-600 hover:bg-blue-50 transition font-medium">Editar</button>
                    )}
                    {can('pets', 'delete') && (
                      <button onClick={() => handleDelete(pet.id)}
                              className="flex-1 py-2 text-red-600 hover:bg-red-50 transition font-medium">Eliminar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && data?.totalPages > 1 && (
            <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border">
              <span className="text-sm text-slate-600">Página {data.page} de {data.totalPages} (Total: {data.total})</span>
              <div className="space-x-2">
                <button disabled={data.page === 1} onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-slate-50">Anterior</button>
                <button disabled={data.page === data.totalPages} onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-slate-50">Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
