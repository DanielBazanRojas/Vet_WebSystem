import { useParams, Link } from 'react-router-dom';
import { useClient } from './useClients';

export default function ClientDetail() {
  const { id } = useParams();
  const { data: client, isLoading, isError } = useClient(id);

  if (isLoading) return <div className="p-6">Cargando detalle del cliente...</div>;
  if (isError || !client) return <div className="p-6 text-red-500">Error al cargar cliente</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/clientes" className="text-slate-500 hover:text-slate-800 font-medium">← Volver a clientes</Link>
        <h1 className="text-2xl font-bold text-slate-800">{client.full_name}</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-slate-700">Datos de Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div><span className="text-sm text-slate-500 block mb-1">DNI</span> <p className="font-medium text-slate-800">{client.dni || '-'}</p></div>
          <div><span className="text-sm text-slate-500 block mb-1">Email</span> <p className="font-medium text-slate-800">{client.email || '-'}</p></div>
          <div><span className="text-sm text-slate-500 block mb-1">Teléfono Principal</span> <p className="font-medium text-slate-800">{client.phone}</p></div>
          <div><span className="text-sm text-slate-500 block mb-1">Teléfono Alternativo</span> <p className="font-medium text-slate-800">{client.phone_alt || '-'}</p></div>
          <div><span className="text-sm text-slate-500 block mb-1">Distrito</span> <p className="font-medium text-slate-800">{client.district || '-'}</p></div>
          <div className="md:col-span-2"><span className="text-sm text-slate-500 block mb-1">Dirección</span> <p className="font-medium text-slate-800">{client.address || '-'}</p></div>
          <div className="md:col-span-2"><span className="text-sm text-slate-500 block mb-1">Notas</span> <p className="font-medium text-slate-800 whitespace-pre-wrap">{client.notes || '-'}</p></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-semibold text-slate-700">Mascotas ({client.pets?.length || 0})</h2>
        </div>
        
        {client.pets?.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-slate-500">Este cliente aún no tiene mascotas registradas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.pets?.map(pet => (
              <div key={pet.id} className="border border-slate-200 rounded-lg p-4 flex flex-col space-y-3 bg-slate-50 hover:bg-white transition shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-slate-800">{pet.name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pet.gender === 'macho' ? 'bg-blue-100 text-blue-800' : pet.gender === 'hembra' ? 'bg-pink-100 text-pink-800' : 'bg-slate-200 text-slate-800'}`}>
                    {pet.gender}
                  </span>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="flex justify-between"><span>Especie:</span> <span className="font-medium text-slate-800">{pet.species_name}</span></p>
                  <p className="flex justify-between"><span>Raza:</span> <span className="font-medium text-slate-800">{pet.breed_name || '-'}</span></p>
                  <p className="flex justify-between"><span>Peso:</span> <span className="font-medium text-slate-800">{pet.weight_kg ? `${pet.weight_kg} kg` : '-'}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
