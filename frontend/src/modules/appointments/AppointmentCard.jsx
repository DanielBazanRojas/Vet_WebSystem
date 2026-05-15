import useAuthStore from '../../store/authStore';

export default function AppointmentCard({ appointment, onClick, onCancel, onConfirm }) {
  const can = useAuthStore(s => s.can);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_atencion': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'atendida': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div 
      className="bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col h-full border-l-4 overflow-hidden relative group/card"
      style={{ borderLeftColor: appointment.color_hex || '#378ADD' }}
      onClick={() => onClick(appointment)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-sm text-slate-800">
          {appointment.scheduled_time.substring(0, 5)}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusColor(appointment.status)}`}>
          {getStatusLabel(appointment.status)}
        </span>
      </div>
      
      <h4 className="font-bold text-slate-800 text-sm truncate">{appointment.pet_name}</h4>
      <p className="text-xs text-slate-500 truncate">{appointment.client_name}</p>
      
      <div className="mt-2 text-xs font-medium px-2 py-1 bg-slate-50 rounded text-slate-600 truncate border border-slate-100">
        {appointment.type_name}
      </div>

      <div className="mt-auto pt-3 flex gap-2" onClick={e => e.stopPropagation()}>
        {appointment.status === 'pendiente' && can('appointments', 'write') && (
          <button 
            onClick={() => onConfirm(appointment)}
            className="flex-1 text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 py-1 rounded transition font-medium"
          >
            Confirmar
          </button>
        )}
        {appointment.status !== 'cancelada' && appointment.status !== 'atendida' && can('appointments', 'delete') && (
          <button 
            onClick={() => onCancel(appointment)}
            className="flex-1 text-[11px] bg-red-50 text-red-700 hover:bg-red-100 py-1 rounded transition font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
