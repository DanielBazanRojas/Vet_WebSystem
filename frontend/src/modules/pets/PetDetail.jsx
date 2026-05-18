import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePet } from './usePets';
import useAuthStore from '../../store/authStore';

export default function PetDetail() {
  const { id } = useParams();
  const { data: pet, isLoading, isError } = usePet(id);
  const can = useAuthStore(s => s.can);
  const [activeTab, setActiveTab] = useState('historial');

  if (isLoading) return <div className="p-6">Cargando...</div>;
  if (isError || !pet) return <div className="p-6 text-red-500">Error al cargar mascota</div>;

  const tabs = [
    { key: 'historial', label: 'Historial Clínico' },
    { key: 'vacunas', label: 'Vacunas' },
    { key: 'estetica', label: 'Estética' },
  ];

  return (
    <div className="space-y-6">
      <Link to="/mascotas" className="text-slate-500 hover:text-slate-800 font-medium">← Volver</Link>

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-3xl shrink-0">🐾</div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{pet.name}</h1>
          <p className="text-slate-500">{pet.species_name} {pet.breed_name ? `· ${pet.breed_name}` : ''} · {pet.gender}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
            {pet.weight_kg && <span>Peso: {pet.weight_kg} kg</span>}
            {pet.color && <span>Color: {pet.color}</span>}
            {pet.is_neutered && <span className="text-green-600 font-medium">Esterilizado</span>}
          </div>
        </div>
      </div>

      {/* Dueño */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-sm font-semibold text-slate-500 mb-2">Dueño</h2>
        <Link to={`/clientes/${pet.client_id}`} className="text-blue-600 hover:underline font-medium">{pet.client_name}</Link>
        <div className="text-sm text-slate-500 mt-1">{pet.client_phone} {pet.client_email ? `· ${pet.client_email}` : ''}</div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex border-b">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium transition ${activeTab === t.key ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'historial' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-700">Últimas consultas</h3>
                {can('consultations', 'write') && (
                  <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">+ Nueva consulta</button>
                )}
              </div>
              {pet.last_consultation ? (
                <div className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-800">{new Date(pet.last_consultation.consultation_date).toLocaleDateString('es-PA')}</span>
                    {pet.last_consultation.is_emergency && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Urgencia</span>}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Dx: {pet.last_consultation.diagnosis || 'Sin diagnóstico'}</p>
                  <p className="text-sm text-slate-500 mt-1">Vet: {pet.last_consultation.veterinarian_name}</p>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-6">Sin consultas registradas</p>
              )}
            </div>
          )}

          {activeTab === 'vacunas' && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-4">Vacunas aplicadas</h3>
              {pet.last_vaccinations?.length > 0 ? (
                <div className="space-y-3">
                  {pet.last_vaccinations.map(v => (
                    <div key={v.id} className="border rounded-lg p-3 bg-slate-50 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800">{v.vaccine_name}</p>
                        <p className="text-xs text-slate-500">{v.disease_protected}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-slate-600">{new Date(v.administered_date).toLocaleDateString('es-PA')}</p>
                        {v.next_dose_date && <p className="text-xs text-blue-600">Próxima: {new Date(v.next_dose_date).toLocaleDateString('es-PA')}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-6">Sin vacunas registradas</p>
              )}
            </div>
          )}

          {activeTab === 'estetica' && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-4">Sesiones de estética</h3>
              <p className="text-slate-400 text-center py-6">Sin sesiones de estética registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
