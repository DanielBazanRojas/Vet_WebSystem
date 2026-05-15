import { useState, useMemo } from 'react';
import { startOfWeek, addDays, format, parse, isSameDay, startOfToday, subWeeks, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppointments, useStaff, useUpdateAppointment, useCancelAppointment } from './useAppointments';
import useAuthStore from '../../store/authStore';
import AppointmentCard from './AppointmentCard';
import AppointmentForm from './AppointmentForm';
import toast from 'react-hot-toast';

const TIME_SLOTS = [];
for (let h = 8; h <= 19; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:30`);
}

export default function AppointmentsPage() {
  const can = useAuthStore(s => s.can);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(startOfToday(), { weekStartsOn: 1 }));
  const [selectedStaff, setSelectedStaff] = useState('');
  
  // Drawer/Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { data: staffList = [] } = useStaff();
  const updateMutation = useUpdateAppointment();
  const cancelMutation = useCancelAppointment();

  // Fetch appointments
  // (In a real app, you might want to fetch by date range. Currently the backend only filters by exact date if provided,
  // or fetches all if not. To optimize, we fetch all and filter in frontend, OR we'd need a date range filter in backend.
  // For now, we'll fetch all or filter by staff)
  const { data: appointments = [], isLoading } = useAppointments({
    assigned_to: selectedStaff || undefined,
  });

  // Days of the week (Monday to Saturday)
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 6; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const handleToday = () => setCurrentWeekStart(startOfWeek(startOfToday(), { weekStartsOn: 1 }));

  const openFormForSlot = (date, time) => {
    setSelectedAppt(null);
    setSelectedSlot({ date: format(date, 'yyyy-MM-dd'), time });
    setIsFormOpen(true);
  };

  const handleConfirmAppt = async (appt) => {
    try {
      await updateMutation.mutateAsync({ id: appt.id, data: { ...appt, status: 'confirmada' } });
      toast.success('Cita confirmada');
    } catch { toast.error('Error al confirmar'); }
  };

  const handleCancelAppt = async (appt) => {
    const reason = window.prompt('Motivo de cancelación:');
    if (reason === null) return;
    try {
      await cancelMutation.mutateAsync({ id: appt.id, reason });
      toast.success('Cita cancelada');
    } catch (e) { toast.error(e.response?.data?.message || 'Error al cancelar'); }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] gap-6 pb-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 hidden md:block">Agenda</h1>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md">
            <button onClick={handlePrevWeek} className="p-1 hover:bg-white rounded transition px-2">{"<"}</button>
            <button onClick={handleToday} className="px-3 py-1 font-medium hover:bg-white rounded transition text-sm">Hoy</button>
            <button onClick={handleNextWeek} className="p-1 hover:bg-white rounded transition px-2">{">"}</button>
          </div>
          <span className="font-medium text-slate-700 text-sm md:text-base capitalize">
            {format(weekDays[0], "MMMM d", { locale: es })} - {format(weekDays[5], "MMMM d, yyyy", { locale: es })}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedStaff} 
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-slate-50 min-w-[200px]"
          >
            <option value="">Todos los profesionales</option>
            {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>

          {can('appointments', 'write') && (
            <button 
              onClick={() => { setSelectedAppt(null); setSelectedSlot(null); setIsFormOpen(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap"
            >
              + Nueva Cita
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border flex flex-col h-[600px] flex-shrink-0">
        <div className="overflow-auto flex-1 relative">
          <table className="w-full border-collapse table-fixed min-w-[800px]">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <th className="w-20 border-b border-r p-2 bg-slate-50"></th>
                {weekDays.map(day => (
                  <th key={day.toISOString()} className="border-b border-r p-2 bg-slate-50">
                    <div className="text-xs uppercase text-slate-500 font-semibold">{format(day, 'EEEE', { locale: es })}</div>
                    <div className={`text-lg ${isSameDay(day, startOfToday()) ? 'text-blue-600 font-bold' : 'text-slate-800'}`}>
                      {format(day, 'd')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(time => (
                <tr key={time}>
                  <td className="border-b border-r p-2 text-xs text-slate-400 text-center align-top bg-slate-50 sticky left-0 z-0 w-20">
                    {time}
                  </td>
                  {weekDays.map(day => {
                    // Buscar citas que coincidan con este día y hora
                    // Nota: Si una cita dura más de 30 mins, lo ideal es que ocupe rowspan.
                    // Para simplificar esta versión, la renderizamos en su slot de inicio.
                    const dayAppointments = appointments.filter(a => {
                      const apptDate = a.scheduled_date.substring(0, 10);
                      const apptTime = a.scheduled_time.substring(0, 5);
                      return apptDate === format(day, 'yyyy-MM-dd') && apptTime === time;
                    });

                    return (
                      <td 
                        key={day.toISOString()} 
                        className="border-b border-r align-top h-24 hover:bg-slate-50 transition relative group cursor-crosshair w-[calc((100%-5rem)/6)]"
                        onClick={() => openFormForSlot(day, time)}
                      >
                        <div className="hidden group-hover:flex absolute inset-0 items-center justify-center text-slate-300 text-2xl font-light pointer-events-none">
                          +
                        </div>
                        {dayAppointments.map(appt => {
                          const slots = appt.duration_min / 30;
                          return (
                            <div 
                              key={appt.id} 
                              className="absolute left-1 right-1 pointer-events-auto z-10"
                              style={{ 
                                top: '4px', 
                                height: `calc(${slots * 100}% + ${Math.max(0, slots - 1)}px - 8px)`
                              }}
                            >
                              <AppointmentCard 
                                appointment={appt} 
                                onClick={(a) => { setSelectedAppt(a); setIsFormOpen(true); }}
                                onConfirm={handleConfirmAppt}
                                onCancel={handleCancelAppt}
                              />
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* List View */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
          Listado de Citas (Semana actual)
        </h2>
        
        {appointments.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">No hay citas para esta semana o el filtro actual.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-3 font-semibold text-slate-600">Fecha y Hora</th>
                  <th className="p-3 font-semibold text-slate-600">Mascota</th>
                  <th className="p-3 font-semibold text-slate-600">Dueño</th>
                  <th className="p-3 font-semibold text-slate-600">Motivo/Tipo</th>
                  <th className="p-3 font-semibold text-slate-600">Estado</th>
                  <th className="p-3 font-semibold text-slate-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt.id} className="border-b hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-800 font-medium whitespace-nowrap">
                      {format(parse(appt.scheduled_date.substring(0, 10), 'yyyy-MM-dd', new Date()), 'dd MMM yyyy', { locale: es })} <br />
                      <span className="text-xs text-slate-500">{appt.scheduled_time.substring(0, 5)} ({appt.duration_min} min)</span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{appt.pet_name}</td>
                    <td className="p-3 text-slate-600">
                      {appt.client_name}<br/>
                      <span className="text-xs text-slate-400">{appt.client_phone}</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      <span className="inline-block px-2 py-1 rounded text-xs border" style={{ borderColor: appt.color_hex, color: appt.color_hex }}>
                        {appt.type_name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full border text-xs font-medium bg-slate-100 uppercase">
                        {appt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => { setSelectedAppt(appt); setIsFormOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer/Modal para Citas */}
      {isFormOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[100] flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l flex flex-col overflow-y-auto z-[101]" style={{ backgroundColor: 'white' }}>
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-[102] shadow-sm">
              <h2 className="text-lg font-bold text-slate-800">
                {selectedAppt ? 'Detalle de Cita' : 'Agendar Cita'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
            </div>
            <div className="p-4 flex-1 bg-white">
              <AppointmentForm 
                initialData={selectedAppt}
                initialDate={selectedSlot?.date}
                initialTime={selectedSlot?.time}
                onSuccess={() => setIsFormOpen(false)}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
