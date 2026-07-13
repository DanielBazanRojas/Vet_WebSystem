import { useState } from 'react';
import { useFeedbackList, useFeedbackStats, useUpdateFeedback } from './useFeedback';
import useAuthStore from '../../store/authStore';
import FeedbackForm from './FeedbackForm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, MessageSquare, CheckCircle, Clock, AlertTriangle, HelpCircle, Reply } from 'lucide-react';

const TYPE_CONFIG = {
  sugerencia: { label: 'Sugerencia', color: 'bg-blue-100 text-blue-700' },
  error: { label: 'Error', color: 'bg-red-100 text-red-700' },
  otro: { label: 'Otro', color: 'bg-slate-100 text-slate-700' },
};

const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  en_revision: { label: 'En revisión', color: 'bg-blue-100 text-blue-700' },
  resuelto: { label: 'Resuelto', color: 'bg-emerald-100 text-emerald-700' },
  descartado: { label: 'Descartado', color: 'bg-slate-100 text-slate-700' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>;
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.otro;
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>;
}

function AdminManageModal({ feedback, onClose }) {
  const [status, setStatus] = useState(feedback.status);
  const [adminNote, setAdminNote] = useState(feedback.admin_note || '');
  const updateMutation = useUpdateFeedback();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ id: feedback.id, data: { status, admin_note: adminNote } });
      toast.success('Feedback actualizado');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl border w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Gestionar Feedback</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Título</p>
            <p className="text-slate-900">{feedback.title}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Descripción</p>
            <p className="text-slate-900 text-sm whitespace-pre-wrap">{feedback.description}</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div><span className="font-semibold text-slate-700">Tipo:</span> <TypeBadge type={feedback.type} /></div>
            <div><span className="font-semibold text-slate-700">Usuario:</span> {feedback.user_name}</div>
            <div><span className="font-semibold text-slate-700">Fecha:</span> {format(new Date(feedback.created_at), 'dd MMM yyyy HH:mm', { locale: es })}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Estado</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm">
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En revisión</option>
              <option value="resuelto">Resuelto</option>
              <option value="descartado">Descartado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nota interna (admin)</label>
            <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm resize-none" placeholder="Nota visible para el usuario cuando el feedback esté resuelto o en revisión" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm font-medium">Cancelar</button>
            <button onClick={handleSave} disabled={updateMutation.isPending} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm disabled:opacity-50">
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserView() {
  const { data, isLoading } = useFeedbackList();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <div className="text-center text-slate-500 py-12">Cargando feedback...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Mis Feedback</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Enviar feedback
        </button>
      </div>

      {showForm && <FeedbackForm onClose={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />}

      {!data?.data?.length ? (
        <div className="bg-white rounded-lg border p-12 text-center text-slate-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">No has enviado feedback todavía</p>
          <p className="text-sm mt-1">Comparte tus sugerencias o reporta errores para mejorar el sistema.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.data.map(item => (
            <div key={item.id} className="bg-white rounded-lg border p-5 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <TypeBadge type={item.type} />
                    <StatusBadge status={item.status} />
                  </div>
                  <h3 className="font-semibold text-slate-800 truncate">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  <p className="text-xs text-slate-400 mt-2">{format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: es })}</p>
                </div>
              </div>
              {item.admin_note && item.status !== 'pendiente' && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 flex gap-2">
                  <Reply className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Respuesta del admin:</p>
                    <p className="text-sm text-slate-700">{item.admin_note}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminView() {
  const [filters, setFilters] = useState({ status: '', type: '', date_from: '', date_to: '', page: 1, limit: 20 });
  const { data, isLoading } = useFeedbackList(filters);
  const statsQuery = useFeedbackStats();
  const [manageItem, setManageItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const stats = statsQuery.data || { pendientes: 0, en_revision: 0, resueltos: 0, descartados: 0 };

  const summaryCards = [
    { label: 'Pendientes', value: stats.pendientes, color: 'bg-amber-100 text-amber-600 border-amber-200' },
    { label: 'En revisión', value: stats.en_revision, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { label: 'Resueltos', value: stats.resueltos, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
    { label: 'Descartados', value: stats.descartados, color: 'bg-slate-100 text-slate-600 border-slate-200' },
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Feedback del Sistema</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Enviar feedback
        </button>
      </div>

      {showForm && <FeedbackForm onClose={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className={`bg-white p-4 rounded-lg border shadow-sm ${card.color} flex items-center gap-3`}>
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-sm font-semibold">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo</label>
          <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500">
            <option value="">Todos</option>
            <option value="sugerencia">Sugerencia</option>
            <option value="error">Error</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Estado</label>
          <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_revision">En revisión</option>
            <option value="resuelto">Resuelto</option>
            <option value="descartado">Descartado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Desde</label>
          <input type="date" value={filters.date_from} onChange={e => handleFilterChange('date_from', e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Hasta</label>
          <input type="date" value={filters.date_to} onChange={e => handleFilterChange('date_to', e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-500 py-12">Cargando...</div>
      ) : !data?.data?.length ? (
        <div className="bg-white rounded-lg border p-12 text-center text-slate-400">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">No hay feedback registrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Usuario</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Título</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Fecha</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.user_name}</td>
                    <td className="px-4 py-3"><TypeBadge type={item.type} /></td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{item.title}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{format(new Date(item.created_at), 'dd/MM/yyyy', { locale: es })}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setManageItem(item)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition">
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t bg-slate-50">
              <span className="text-sm text-slate-500">Página {data.page} de {data.totalPages} ({data.total} registros)</span>
              <div className="flex gap-2">
                <button disabled={data.page <= 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-slate-100">Anterior</button>
                <button disabled={data.page >= data.totalPages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-slate-100">Siguiente</button>
              </div>
            </div>
          )}
        </div>
      )}

      {manageItem && <AdminManageModal feedback={manageItem} onClose={() => setManageItem(null)} />}
    </div>
  );
}

export default function FeedbackPage() {
  const { can } = useAuthStore();
  const isAdmin = can('config', 'ver');

  return isAdmin ? <AdminView /> : <UserView />;
}
