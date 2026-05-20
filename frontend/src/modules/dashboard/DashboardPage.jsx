import { useDashboardStats } from './useDashboard';
import useAuthStore from '../../store/authStore';
import { Calendar, Users, DollarSign, AlertTriangle, ShieldAlert, Syringe } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useDashboardStats();

  const canSeeAlerts = user?.permissions?.some(p => p.module === 'farmacia' && p.action === 'alertas');

  if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando dashboard...</div>;

  const stats = data?.stats || { citas_hoy: 0, nuevos_clientes_mes: 0, ingresos_mes: 0, alertas_stock_activas: 0 };
  const citas = data?.citas || [];
  const alertas = data?.alertas || [];
  const reminders = data?.reminders || [];

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">¡Hola, {user?.full_name}!</h1>
        <p className="text-slate-500 mt-1">Este es el resumen de las operaciones para hoy en la veterinaria.</p>
      </div>

      {/* Grid de 4 Cards Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Calendar className="w-6 h-6"/></div>
          <div>
            <p className="text-slate-500 text-sm font-semibold">Citas de Hoy</p>
            <p className="text-2xl font-bold text-slate-800">{stats.citas_hoy}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full"><Users className="w-6 h-6"/></div>
          <div>
            <p className="text-slate-500 text-sm font-semibold">Nuevos Clientes (Mes)</p>
            <p className="text-2xl font-bold text-slate-800">{stats.nuevos_clientes_mes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-violet-100 text-violet-600 rounded-full"><DollarSign className="w-6 h-6"/></div>
          <div>
            <p className="text-slate-500 text-sm font-semibold">Ingresos del Mes</p>
            <p className="text-2xl font-bold text-slate-800">${stats.ingresos_mes.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-full"><AlertTriangle className="w-6 h-6"/></div>
          <div>
            <p className="text-slate-500 text-sm font-semibold">Alertas de Stock</p>
            <p className="text-2xl font-bold text-slate-800">{stats.alertas_stock_activas}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1 & 2: Próximas Citas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-slate-700">Agenda de Citas para Hoy</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {citas.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No hay citas agendadas para hoy.</div>
              ) : (
                citas.map(cita => (
                  <div key={cita.id} className="p-4 hover:bg-slate-50 flex justify-between items-center transition">
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">{cita.scheduled_time.substring(0, 5)}</span>
                        {cita.pet_name}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">Dueño: {cita.client_name} • Responsable: {cita.assigned_to_name || 'Sin asignar'}</div>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase \${cita.status === 'pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {cita.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna 3: Alertas de Stock y Recordatorios de Vacunas */}
        <div className="space-y-6">
          {/* Alertas de Stock */}
          {canSeeAlerts && (
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h2 className="font-bold text-slate-700">Alertas de Stock Críticas</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {alertas.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">Sin alertas pendientes.</div>
                ) : (
                  alertas.map(al => (
                    <div key={al.id} className="p-4 hover:bg-slate-50 transition">
                      <div className="font-semibold text-sm text-slate-800">{al.product_name}</div>
                      <div className="text-xs text-red-500 mt-1 font-medium">Stock: {al.current_stock} (Mín: {al.threshold_value})</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Recordatorios de Vacunas */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-slate-700">Recordatorios de Vacunas</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {reminders.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-sm">Sin recordatorios próximos.</div>
              ) : (
                reminders.map(rem => (
                  <div key={rem.id} className="p-4 hover:bg-slate-50 transition">
                     <div className="font-semibold text-sm text-slate-800">{rem.vaccine_name}</div>
                     <div className="text-xs text-slate-500 mt-1">Mascota: {rem.pet_name} ({rem.client_name})</div>
                     <div className="text-xs text-emerald-600 font-bold mt-1">Vence el: {format(new Date(rem.due_date), 'dd MMM yyyy', { locale: es })}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
