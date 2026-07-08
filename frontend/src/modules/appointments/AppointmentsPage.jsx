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
  const [selectedMobileDay, setSelectedMobileDay] = useState(startOfToday());
  const [selectedStaff, setSelectedStaff] = useState('');

  // Drawer/Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { data: staffList = [] } = useStaff();
  const updateMutation = useUpdateAppointment();
  const cancelMutation = useCancelAppointment();

  // Fetch appointments
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

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    setSelectedMobileDay(d => addDays(d, -7));
  };
  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    setSelectedMobileDay(d => addDays(d, 7));
  };
  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(startOfToday(), { weekStartsOn: 1 }));
    setSelectedMobileDay(startOfToday());
  };

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
    <div className="flex flex-col min-h-[calc(100vh-6rem)] gap-6 pb-6 w-full">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-slate-50 w-full sm:min-w-[200px]"
          >
            <option value="">Todos los profesionales</option>
            {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>

          {can('appointments', 'write') && (
            <button
              onClick={() => { setSelectedAppt(null); setSelectedSlot(null); setIsFormOpen(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap text-center"
            >
              + Nueva Cita
            </button>
          )}
        </div>
      </div>

      {/* Mobile Calendar View */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:hidden flex flex-col gap-4">
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => setSelectedMobileDay(d => addDays(d, -1))}
            className="px-3 py-1.5 border rounded bg-slate-50 text-slate-700 font-medium text-sm"
          >
            &lt;
          </button>
          <span className="font-bold text-slate-800 capitalize text-sm">
            {format(selectedMobileDay, "EEEE, d 'de' MMMM", { locale: es })}
          </span>
          <button
            onClick={() => setSelectedMobileDay(d => addDays(d, 1))}
            className="px-3 py-1.5 border rounded bg-slate-50 text-slate-700 font-medium text-sm"
          >
            &gt;
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-semibold text-slate-700 text-sm">Citas del día</h3>
            {can('appointments', 'write') && (
              <button
                onClick={() => openFormForSlot(selectedMobileDay, '09:00')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                + Agendar para hoy
              </button>
            )}
          </div>
          {appointments.filter(a => a.scheduled_date.substring(0, 10) === format(selectedMobileDay, 'yyyy-MM-dd')).length === 0 ? (
            <p className="text-slate-500 text-center py-6 text-sm">No hay citas para este día.</p>
          ) : (
            <div className="space-y-3">
              {appointments
                .filter(a => a.scheduled_date.substring(0, 10) === format(selectedMobileDay, 'yyyy-MM-dd'))
                .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
                .map(appt => (
                  <div
                    key={appt.id}
                    onClick={() => { setSelectedAppt(appt); setIsFormOpen(true); }}
                    className="p-4 border rounded-lg hover:shadow-md transition bg-slate-50 space-y-2 relative cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded font-semibold">
                        {appt.scheduled_time.substring(0, 5)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full border text-[10px] font-medium bg-white uppercase">
                        {appt.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">{appt.pet_name}</div>
                    <div className="text-xs text-slate-500">
                      Dueño: {appt.client_name} • Profesional: {appt.assigned_to_name || 'Sin asignar'}
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="inline-block px-1.5 py-0.5 rounded border text-[10px] font-semibold" style={{ borderColor: appt.color_hex, color: appt.color_hex }}>
                        {appt.type_name}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid - Desktop */}
      <div className="bg-white rounded-lg shadow-sm border hidden md:flex flex-col h-[600px] flex-shrink-0">
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
                              onClick={(e) => e.stopPropagation()}
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
            <table className="w-full text-left border-collapse text-sm block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-slate-50 border-b">
                  <th className="p-3 font-semibold text-slate-600">Fecha y Hora</th>
                  <th className="p-3 font-semibold text-slate-600">Mascota</th>
                  <th className="p-3 font-semibold text-slate-600">Dueño</th>
                  <th className="p-3 font-semibold text-slate-600">Motivo/Tipo</th>
                  <th className="p-3 font-semibold text-slate-600">Estado</th>
                  <th className="p-3 font-semibold text-slate-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y divide-slate-100">
                {appointments.map(appt => (
                  <tr key={appt.id} className="block md:table-row hover:bg-slate-50 transition border-b md:border-b-0 py-3 md:py-0 space-y-2 md:space-y-0">
                    <td className="p-3 text-slate-800 font-medium whitespace-nowrap block md:table-cell flex justify-between items-center">
                      <span className="md:hidden font-semibold text-slate-500">Fecha y Hora:</span>
                      <div className="text-right md:text-left">
                        {format(parse(appt.scheduled_date.substring(0, 10), 'yyyy-MM-dd', new Date()), 'dd MMM yyyy', { locale: es })} <br />
                        <span className="text-xs text-slate-500">{appt.scheduled_time.substring(0, 5)} ({appt.duration_min} min)</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-800 block md:table-cell flex justify-between items-center">
                      <span className="md:hidden font-semibold text-slate-500">Mascota:</span>
                      <span>{appt.pet_name}</span>
                    </td>
                    <td className="p-3 text-slate-600 block md:table-cell flex justify-between items-center">
                      <span className="md:hidden font-semibold text-slate-500">Dueño:</span>
                      <div className="text-right md:text-left">
                        {appt.client_name}<br />
                        <span className="text-xs text-slate-400">{appt.client_phone}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 block md:table-cell flex justify-between items-center">
                      <span className="md:hidden font-semibold text-slate-500">Motivo/Tipo:</span>
                      <span className="inline-block px-2 py-1 rounded text-xs border" style={{ borderColor: appt.color_hex, color: appt.color_hex }}>
                        {appt.type_name}
                      </span>
                    </td>
                    <td className="p-3 block md:table-cell flex justify-between items-center">
                      <span className="md:hidden font-semibold text-slate-500">Estado:</span>
                      <span className="px-2 py-1 rounded-full border text-xs font-medium bg-slate-100 uppercase">
                        {appt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right block md:table-cell flex justify-between md:justify-end items-center border-t md:border-t-0 pt-2 md:pt-0">
                      <span className="md:hidden font-semibold text-slate-500">Acciones:</span>
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
          <div className="bg-white w-full md:max-w-lg h-full shadow-2xl border-l flex flex-col overflow-y-auto z-[101]" style={{ backgroundColor: 'white' }}>
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
