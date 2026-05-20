import { Link } from 'react-router-dom';
import { useAllConsultations } from './useConsultations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Stethoscope, AlertOctagon, User, Clock, ArrowRight } from 'lucide-react';

export default function ConsultationsPage() {
  const { data: consultations = [], isLoading, error } = useAllConsultations();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Cargando consultas médicas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-2xl mx-auto mt-10">
        <h3 className="font-bold text-lg mb-2">Error al cargar las consultas</h3>
        <p>{error.message || 'Ha ocurrido un error inesperado al intentar recuperar el historial clínico global.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            Historial de Consultas Clínicas
          </h1>
          <p className="text-slate-500 mt-1">Gestión y visualización global de todos los registros médicos y atenciones clínicas realizados.</p>
        </div>
      </div>

      {/* Grid or List of Consultations */}
      {consultations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {consultations.map(c => {
            const dateStr = format(new Date(c.consultation_date), "dd 'de' MMMM, yyyy", { locale: es });
            const timeStr = format(new Date(c.consultation_date), "HH:mm", { locale: es });
            
            return (
              <div 
                key={c.id} 
                className={`relative group bg-white border rounded-xl p-5 shadow-sm transition hover:shadow-md hover:border-blue-300 flex flex-col justify-between ${
                  c.is_emergency ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'
                }`}
              >
                <div>
                  {/* Meta (Date + Emergency Tag) */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center text-slate-400 text-xs gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateStr} a las {timeStr}</span>
                    </div>
                    {c.is_emergency && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        <AlertOctagon className="w-3 h-3" />
                        Urgencia
                      </span>
                    )}
                  </div>

                  {/* Pet Name */}
                  <Link to={`/mascotas/${c.pet_id}`} className="inline-block text-xl font-bold text-slate-800 hover:text-blue-600 hover:underline mb-1">
                    🐾 {c.pet_name}
                  </Link>

                  {/* Complaint & Diagnosis details */}
                  <div className="space-y-2 mt-2">
                    {c.chief_complaint && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        <strong className="text-slate-800 font-semibold">Motivo: </strong>
                        {c.chief_complaint}
                      </p>
                    )}
                    {c.diagnosis && (
                      <p className="text-sm text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100 font-mono text-xs">
                        <strong className="text-slate-800 font-sans font-semibold text-sm">Dx: </strong>
                        {c.diagnosis}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer elements */}
                <div className="flex justify-between items-center border-t pt-4 mt-4 text-xs">
                  <span className="flex items-center text-slate-500 gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Vet: Dr(a). {c.veterinarian_name}
                  </span>
                  
                  <Link 
                    to={`/consultas/${c.id}`} 
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-md group-hover:bg-blue-600 group-hover:text-white transition"
                  >
                    <span>Ver Ficha</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl py-16 text-center max-w-xl mx-auto space-y-4">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">Sin consultas registradas</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Actualmente no existen registros médicos almacenados globalmente en la clínica.</p>
        </div>
      )}

    </div>
  );
}
