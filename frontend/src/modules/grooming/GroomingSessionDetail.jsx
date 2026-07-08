import { useParams, useNavigate } from 'react-router-dom';
import { useSession, useUpdateSession, useRemoveService, useGroomingCatalog, useAddService } from './useGrooming';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Scissors, AlertTriangle, ArrowLeft, CheckCircle, Plus, Trash2, FileText } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateInvoice } from '../billing/useBilling';

export default function GroomingSessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession(id);
  const updateSession = useUpdateSession();
  const removeService = useRemoveService();
  const { user } = useAuthStore();
  const canInvoice = user?.permissions?.some(p => p.module === 'facturacion' && p.action === 'crear');

  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const createInvoice = useCreateInvoice();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando sesión...</div>;
  if (!session) return <div className="p-8 text-center text-red-500">Sesión no encontrada</div>;

  const isCompleted = session.status === 'completada';

  const handleCreateInvoice = async () => {
    try {
      const invoice = await createInvoice.mutateAsync({
        client_id: session.client_id,
        pet_id: session.pet_id,
        grooming_session_id: session.id,
        notes: `Factura generada desde sesión de estética para ${session.pet_name}`
      });
      toast.success('Factura borrador creada');
      navigate(`/facturacion/${invoice.id}`);
    } catch (error) {
      toast.error('Error al crear la factura');
    }
  };

  const handleCloseSession = async () => {
    if (session.services.length === 0) {
      toast.error('No puedes completar una sesión sin servicios');
      return;
    }
    if (!window.confirm('¿Estás seguro de cerrar esta sesión? Se calculará el total y no se podrán agregar más servicios.')) return;
    
    try {
      await updateSession.mutateAsync({ id, data: { status: 'completada' } });
      toast.success('Sesión completada exitosamente');
    } catch (error) {
      toast.error('Error al cerrar la sesión');
    }
  };

  const handleRemoveService = async (serviceId) => {
    if (!window.confirm('¿Quitar este servicio?')) return;
    try {
      await removeService.mutateAsync({ sessionId: id, serviceId });
      toast.success('Servicio quitado');
    } catch (error) {
      toast.error('Error al quitar el servicio');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente': return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">Pendiente</span>;
      case 'en_proceso': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">En Proceso</span>;
      case 'completada': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Completada</span>;
      case 'cancelada': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">Cancelada</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-semibold">{status}</span>;
    }
  };

  const currentTotal = session.services.reduce((acc, s) => acc + parseFloat(s.price_charged), 0);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/estetica')} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Sesión Estética de {session.pet_name}
            </h1>
            <p className="text-slate-500">
              {format(new Date(session.session_date), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              {' • '}
              Dueño: {session.client_name}
              {' • '}
              Estilista: {session.groomer_name || 'No asignado'}
            </p>
          </div>
        </div>
        <div>
          {getStatusBadge(session.status)}
        </div>
      </div>

      <div className="space-y-6">
        {session.special_care_notes && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800">Cuidados Especiales / Advertencias</h3>
              <p className="text-amber-700 whitespace-pre-wrap mt-1">{session.special_care_notes}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-pink-500" />
              Servicios Realizados
            </h3>
            {!isCompleted && (
              <button 
                onClick={() => setIsAddServiceModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 hover:bg-pink-200 rounded text-sm font-semibold transition"
              >
                <Plus className="w-4 h-4" /> Agregar Servicio
              </button>
            )}
          </div>
          
          <div className="p-0">
            {session.services.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-200 block md:table">
                <tbody className="bg-white divide-y divide-slate-100 block md:table-row-group">
                  {session.services.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 block md:table-row border-b md:border-b-0 py-2.5 md:py-0 space-y-1.5 md:space-y-0">
                      <td className="px-6 py-4 block md:table-cell flex justify-between items-center">
                        <span className="md:hidden font-semibold text-slate-500">Servicio:</span>
                        <div className="text-right md:text-left">
                          <div className="font-medium text-slate-800">{s.service_name}</div>
                          {s.notes && <div className="text-sm text-slate-500 mt-1">{s.notes}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-700 block md:table-cell flex justify-between items-center md:text-right">
                        <span className="md:hidden font-semibold text-slate-500">Precio:</span>
                        <span>${parseFloat(s.price_charged).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-right w-full md:w-20 block md:table-cell flex justify-between md:justify-end items-center border-t md:border-t-0 pt-2 md:pt-0">
                        <span className="md:hidden font-semibold text-slate-500">Acción:</span>
                        {!isCompleted && (
                          <button onClick={() => handleRemoveService(s.id)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 block md:table-row border-t font-bold">
                    <td className="px-6 py-4 text-right font-bold text-slate-700 uppercase block md:table-cell flex justify-between items-center">
                      <span className="md:hidden">Concepto:</span>
                      <span>Total</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 text-lg block md:table-cell flex justify-between items-center md:text-right">
                      <span className="md:hidden">Monto:</span>
                      <span>${isCompleted ? parseFloat(session.total_amount).toFixed(2) : currentTotal.toFixed(2)}</span>
                    </td>
                    <td className="block md:table-cell"></td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400">No hay servicios agregados a esta sesión.</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          {!isCompleted && (
            <button 
              onClick={handleCloseSession}
              className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition shadow-sm flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> Completar y Cerrar Sesión
            </button>
          )}
          {isCompleted && canInvoice && (
            <button 
              onClick={handleCreateInvoice}
              disabled={createInvoice.isPending}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <FileText className="w-5 h-5" /> {createInvoice.isPending ? 'Generando...' : 'Generar Factura'}
            </button>
          )}
        </div>
      </div>

      {isAddServiceModalOpen && <AddServiceModal sessionId={id} onClose={() => setIsAddServiceModalOpen(false)} />}
    </div>
  );
}

function AddServiceModal({ sessionId, onClose }) {
  const { data: catalog = [] } = useGroomingCatalog();
  const addService = useAddService();
  const [selectedService, setSelectedService] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) return toast.error('Selecciona un servicio');
    
    setIsSubmitting(true);
    try {
      await addService.mutateAsync({ sessionId, data: { grooming_service_id: selectedService, notes } });
      toast.success('Servicio agregado');
      onClose();
    } catch (error) {
      toast.error('Error al agregar el servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '400px', padding: '24px' }}>
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Agregar Servicio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Servicio *</label>
            <select 
              value={selectedService} 
              onChange={e => setSelectedService(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">-- Seleccionar --</option>
              {catalog.map(c => (
                <option key={c.id} value={c.id}>{c.name} (Base: ${c.base_price})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas adicionales</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              rows={2} 
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500" 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50">
              {isSubmitting ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
