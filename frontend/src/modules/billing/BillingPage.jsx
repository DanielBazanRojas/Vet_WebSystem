import { useState } from 'react';
import { useInvoices } from './useBilling';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvoiceForm from './InvoiceForm';
import ReportsPage from './ReportsPage';
import useAuthStore from '../../store/authStore';

const getStatusBadge = (status) => {
  switch (status) {
    case 'borrador': return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-semibold">Borrador</span>;
    case 'emitida': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">Emitida</span>;
    case 'pagada': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">Pagada</span>;
    case 'pagada_parcial': return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">Pago Parcial</span>;
    case 'anulada': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">Anulada</span>;
    default: return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-semibold">{status}</span>;
  }
};

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('facturas');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  const { can } = useAuthStore();
  const canCreateInvoice = can('invoices', 'write');
  const canViewReports = can('invoices', 'delete'); // Solo admin tiene delete

  const { data: invoices = [], isLoading } = useInvoices();

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) || 
                        inv.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? inv.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Facturación</h1>
          <p className="text-slate-500 mt-1">Gestión de facturas, pagos y reportes de ingresos.</p>
        </div>
        {activeTab === 'facturas' && canCreateInvoice && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm font-semibold"
          >
            <Plus className="w-5 h-5" /> Nueva Factura
          </button>
        )}
      </div>

      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('facturas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'facturas' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Facturas
          </button>
          {canViewReports && (
            <button 
              onClick={() => setActiveTab('reportes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reportes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Reportes
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'facturas' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por número o cliente..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="emitida">Emitida</option>
              <option value="pagada">Pagada</option>
              <option value="pagada_parcial">Pagada Parcial</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
          
          <div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="px-6 py-3 font-semibold">Número</th>
                  <th className="px-6 py-3 font-semibold">Cliente</th>
                  <th className="px-6 py-3 font-semibold">Fecha Emisión</th>
                  <th className="px-6 py-3 font-semibold text-right">Total</th>
                  <th className="px-6 py-3 font-semibold text-center">Estado</th>
                  <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No se encontraron facturas.</td></tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-700">{inv.invoice_number || 'Borrador'}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{inv.client_name}</div>
                        {inv.pet_name && <div className="text-sm text-slate-500">Mascota: {inv.pet_name}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {format(new Date(inv.issue_date), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        ${parseFloat(inv.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/facturacion/${inv.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                          title="Ver Detalle"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reportes' && <ReportsPage />}

      {isFormOpen && <InvoiceForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
