import { useState } from 'react';
import { useProducts, useMovements } from './usePharmacy';
import ProductForm from './ProductForm';
import LotForm from './LotForm';
import AlertsPanel from './AlertsPanel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, AlertCircle, History, Plus, Search } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function PharmacyPage() {
  const [activeTab, setActiveTab] = useState('products');
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            Módulo de Farmacia e Inventario
          </h1>
          <p className="text-slate-500 mt-1">Gestión completa de medicamentos, productos estéticos y control de stock.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b">
        <button 
          onClick={() => setActiveTab('products')} 
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'products' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Package className="w-4 h-4" /> Productos
        </button>
        <button 
          onClick={() => setActiveTab('movements')} 
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'movements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <History className="w-4 h-4" /> Movimientos
        </button>
        <button 
          onClick={() => setActiveTab('alerts')} 
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'alerts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <AlertCircle className="w-4 h-4" /> Alertas
        </button>
      </div>

      <div>
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'movements' && <MovementsTab />}
        {activeTab === 'alerts' && <AlertsPanel />}
      </div>
    </div>
  );
}

function ProductsTab() {
  const [filters, setFilters] = useState({ search: '' });
  const { data: products = [], isLoading } = useProducts(filters);
  const { user } = useAuthStore();
  const canCreate = user?.permissions?.some(p => p.module === 'farmacia' && p.action === 'crear');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [lotModalProduct, setLotModalProduct] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        {canCreate && (
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 block md:table">
          <thead className="hidden md:table-header-group bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Stock Actual</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Mínimo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200 block md:table-row-group">
            {isLoading ? (
              <tr className="block md:table-row"><td colSpan="6" className="px-6 py-8 text-center text-slate-500 block md:table-cell">Cargando catálogo...</td></tr>
            ) : products.length > 0 ? (
              products.map(p => {
                const isLowStock = parseFloat(p.current_stock) <= parseFloat(p.min_stock_alert);
                return (
                  <tr key={p.id} className={`block md:table-row border-b md:border-b-0 py-3 md:py-0 space-y-2 md:space-y-0 ${isLowStock ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 block md:table-cell flex justify-between items-center">
                      <span className="md:hidden font-semibold text-slate-500">Producto:</span>
                      <div className="flex items-center text-right md:text-left">
                        <div>
                          <div className={`text-sm font-medium ${isLowStock ? 'text-red-800' : 'text-slate-900'}`}>{p.name}</div>
                          <div className="text-xs text-slate-500">SKU: {p.sku || 'N/A'}</div>
                        </div>
                        {p.has_active_alert && <AlertCircle className="w-4 h-4 text-amber-500 ml-2" title="Alerta Activa" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 block md:table-cell flex justify-between items-center">
                      <span className="md:hidden font-semibold text-slate-500">Categoría:</span>
                      <span>{p.category_name || 'Sin categoría'}</span>
                    </td>
                    <td className="px-6 py-4 text-center block md:table-cell flex justify-between items-center md:text-center">
                      <span className="md:hidden font-semibold text-slate-500">Stock Actual:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isLowStock ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {p.current_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-500 block md:table-cell flex justify-between items-center md:text-center">
                      <span className="md:hidden font-semibold text-slate-500">Mínimo:</span>
                      <span>{p.min_stock_alert}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-700 font-medium block md:table-cell flex justify-between items-center md:text-right">
                      <span className="md:hidden font-semibold text-slate-500">Precio:</span>
                      <span>${parseFloat(p.sale_price).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium block md:table-cell flex justify-between md:justify-center items-center border-t md:border-t-0 pt-2 md:pt-0">
                      <span className="md:hidden font-semibold text-slate-500">Acciones:</span>
                      <button 
                        onClick={() => setLotModalProduct(p)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition"
                      >
                        + Lote / Entrada
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="block md:table-row"><td colSpan="6" className="px-6 py-8 text-center text-slate-500 block md:table-cell">No se encontraron productos.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isProductModalOpen && <ProductForm onClose={() => setIsProductModalOpen(false)} />}
      {lotModalProduct && <LotForm product={lotModalProduct} onClose={() => setLotModalProduct(null)} />}
    </div>
  );
}

function MovementsTab() {
  const { data: movements = [], isLoading } = useMovements({});
  
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 block md:table">
        <thead className="hidden md:table-header-group bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Producto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Cantidad</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Balance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Usuario</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200 block md:table-row-group">
          {isLoading ? (
            <tr className="block md:table-row"><td colSpan="6" className="px-6 py-8 text-center text-slate-500 block md:table-cell">Cargando historial...</td></tr>
          ) : movements.length > 0 ? (
            movements.map(m => (
              <tr key={m.id} className="hover:bg-slate-50 block md:table-row border-b md:border-b-0 py-3 md:py-0 space-y-2 md:space-y-0">
                <td className="px-6 py-4 text-sm text-slate-500 block md:table-cell flex justify-between items-center">
                  <span className="md:hidden font-semibold text-slate-500">Fecha:</span>
                  <span>{format(new Date(m.created_at), "dd/MM/yyyy HH:mm")}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 block md:table-cell flex justify-between items-center">
                  <span className="md:hidden font-semibold text-slate-500">Producto:</span>
                  <span>{m.product_name}</span>
                </td>
                <td className="px-6 py-4 text-sm block md:table-cell flex justify-between items-center">
                  <span className="md:hidden font-semibold text-slate-500">Tipo:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.movement_type === 'entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {m.movement_type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-slate-700 font-bold block md:table-cell flex justify-between items-center md:text-center">
                  <span className="md:hidden font-semibold text-slate-500">Cantidad:</span>
                  <span>{m.movement_type === 'entrada' ? '+' : '-'}{m.quantity}</span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-slate-500 block md:table-cell flex justify-between items-center md:text-center">
                  <span className="md:hidden font-semibold text-slate-500">Balance:</span>
                  <span>{m.stock_before} → {m.stock_after}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 block md:table-cell flex justify-between items-center">
                  <span className="md:hidden font-semibold text-slate-500">Usuario:</span>
                  <span>{m.performed_by_name || 'Sistema'}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr className="block md:table-row"><td colSpan="6" className="px-6 py-8 text-center text-slate-500 block md:table-cell">No hay movimientos registrados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
