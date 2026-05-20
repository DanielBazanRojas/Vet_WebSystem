import { useState } from 'react';
import { useSessions } from './useGrooming';
import GroomingSessionForm from './GroomingSessionForm';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Scissors, Plus, Search, Calendar, User, Clock } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function GroomingPage() {
  const { data: sessions = [], isLoading } = useSessions();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canCreate = user?.permissions?.some(p => p.module === 'estetica' && p.action === 'crear');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(s => 
    s.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.client_name && s.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente': return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold">Pendiente</span>;
      case 'en_proceso': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">En Proceso</span>;
      case 'completada': return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">Completada</span>;
      case 'cancelada': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">Cancelada</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Scissors className="w-8 h-8 text-pink-500" />
            Módulo de Estética (Grooming)
          </h1>
          <p className="text-slate-500 mt-1">Control de sesiones de baño, corte y servicios estéticos.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por mascota o dueño..." 
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {canCreate && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Nueva Sesión
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Cargando sesiones...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map(session => (
            <div 
              key={session.id} 
              onClick={() => navigate(`/estetica/${session.id}`)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-pink-300 transition cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{session.pet_name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <User className="w-3 h-3" /> {session.client_name}
                  </p>
                </div>
                {getStatusBadge(session.status)}
              </div>
              <div className="p-5 bg-slate-50 flex-1 space-y-3">
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {format(new Date(session.session_date), "EEEE, d 'de' MMMM yyyy", { locale: es })}
                </div>
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {format(new Date(session.session_date), "HH:mm")}
                </div>
                {session.groomer_name && (
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <Scissors className="w-4 h-4 text-slate-400" />
                    Estilista: {session.groomer_name}
                  </div>
                )}
                {session.special_care_notes && (
                  <div className="mt-3 p-2 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200 line-clamp-2">
                    <strong>¡Atención!</strong> {session.special_care_notes}
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredSessions.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No se encontraron sesiones.
            </div>
          )}
        </div>
      )}

      {isFormOpen && <GroomingSessionForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
