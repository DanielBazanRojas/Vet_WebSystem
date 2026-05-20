import { useAlerts, useResolveAlert } from './usePharmacy';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Clock, CheckCircle, PackageX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AlertsPanel() {
  const { data: alerts = [], isLoading } = useAlerts();
  const resolveAlert = useResolveAlert();

  const handleResolve = async (id) => {
    try {
      await resolveAlert.mutateAsync(id);
      toast.success('Alerta marcada como resuelta');
    } catch (error) {
      toast.error('Error al resolver la alerta');
    }
  };

  const getAlertBadge = (type) => {
    switch (type) {
      case 'lote_vencido':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Vencido</span>;
      case 'vencimiento_proximo':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/> Próximo a vencer</span>;
      case 'stock_minimo':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold flex items-center gap-1"><PackageX className="w-3 h-3"/> Stock Mínimo</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">{type}</span>;
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando alertas...</div>;

  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-12 text-center max-w-xl mx-auto space-y-4">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-emerald-800">Todo en orden</h3>
          <p className="text-emerald-600 text-sm max-w-sm mx-auto">No hay alertas de inventario sin resolver. El stock y los lotes están controlados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map(a => (
            <div key={a.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  {getAlertBadge(a.alert_type)}
                  <span className="text-xs text-slate-400">{format(new Date(a.created_at), "dd/MM/yyyy", { locale: es })}</span>
                </div>
                
                <h4 className="font-bold text-slate-800 mb-1">{a.product_name}</h4>
                <div className="text-sm text-slate-600 space-y-1">
                  <p><strong>SKU:</strong> {a.sku || 'N/A'}</p>
                  <p><strong>Stock Actual:</strong> <span className={a.alert_type === 'stock_minimo' ? 'text-red-600 font-bold' : ''}>{a.current_stock}</span></p>
                  {a.alert_type === 'stock_minimo' && <p><strong>Stock Mínimo Permitido:</strong> {a.min_stock_alert}</p>}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-end">
                <button 
                  onClick={() => handleResolve(a.id)}
                  disabled={resolveAlert.isPending}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded transition"
                >
                  Marcar Resuelta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
