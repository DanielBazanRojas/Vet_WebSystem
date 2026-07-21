import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useInvoice, useAddInvoiceItem, useRemoveInvoiceItem, useEmitInvoice, useCancelInvoice, useRegisterPayment, usePaymentMethods } from './useBilling';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, CheckCircle, FileText, Ban, Trash2, Plus, DollarSign, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadInvoicePdf } from './billing.api';

// Helper for badges
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

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id);
  const addInvoiceItem = useAddInvoiceItem();
  const removeInvoiceItem = useRemoveInvoiceItem();
  const emitInvoice = useEmitInvoice();
  const cancelInvoice = useCancelInvoice();

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500">Factura no encontrada</div>;

  const isBorrador = invoice.status === 'borrador';
  const canReceivePayment = invoice.status === 'emitida' || invoice.status === 'pagada_parcial';
  
  const totalPagado = invoice.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
  const saldoPendiente = parseFloat(invoice.total) - totalPagado;

  const handleEmit = async () => {
    if (invoice.items.length === 0) return toast.error('Agrega ítems antes de emitir');
    if (!window.confirm('¿Emitir esta factura? Ya no podrás modificar los ítems.')) return;
    try {
      await emitInvoice.mutateAsync(id);
      toast.success('Factura emitida');
    } catch (e) { toast.error('Error al emitir'); }
  };

  const handleCancel = async () => {
    if (!window.confirm('¿Anular esta factura?')) return;
    try {
      await cancelInvoice.mutateAsync(id);
      toast.success('Factura anulada');
    } catch (e) { toast.error('Error al anular'); }
  };

  const handleDownloadPdf = async () => {
    setIsPdfLoading(true);
    try {
      await downloadInvoicePdf(id, invoice.invoice_number);
      toast.success('PDF descargado');
    } catch (e) {
      toast.error('Error al generar el PDF');
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/facturacion')} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Factura {invoice.invoice_number}
            </h1>
            <p className="text-slate-500">
              {format(new Date(invoice.issue_date), "dd 'de' MMMM, yyyy", { locale: es })}
              {' • '}
              Cliente: {invoice.client_name}
              {invoice.pet_name && ` • Mascota: ${invoice.pet_name}`}
            </p>
          </div>
        </div>
        <div>
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Ítems
              </h3>
              {isBorrador && (
                <button onClick={() => setIsAddItemOpen(true)} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded font-semibold hover:bg-blue-200">
                  <Plus className="w-4 h-4" /> Agregar Ítem
                </button>
              )}
            </div>
            <div>
              <table className="w-full text-left block md:table">
                <thead className="hidden md:table-header-group bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="px-4 py-2">Descripción</th>
                    <th className="px-4 py-2 text-right">Cant.</th>
                    <th className="px-4 py-2 text-right">P. Unit</th>
                    <th className="px-4 py-2 text-right">Desc.</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                    {isBorrador && <th className="px-4 py-2"></th>}
                  </tr>
                </thead>
                <tbody className="block md:table-row-group divide-y divide-slate-100">
                  {invoice.items.length === 0 ? (
                    <tr className="block md:table-row"><td colSpan={6} className="px-4 py-8 text-center text-slate-400 block md:table-cell">Sin ítems</td></tr>
                  ) : (
                    invoice.items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 block md:table-row border-b md:border-b-0 py-3 md:py-0 space-y-2 md:space-y-0">
                        <td className="px-4 py-3 block md:table-cell flex justify-between items-center">
                          <span className="md:hidden font-semibold text-slate-500">Descripción:</span>
                          <span>{item.description}</span>
                        </td>
                        <td className="px-4 py-3 text-right block md:table-cell flex justify-between items-center">
                          <span className="md:hidden font-semibold text-slate-500">Cant:</span>
                          <span>{parseFloat(item.quantity)}</span>
                        </td>
                        <td className="px-4 py-3 text-right block md:table-cell flex justify-between items-center">
                          <span className="md:hidden font-semibold text-slate-500">P. Unit:</span>
                          <span>S/.{parseFloat(item.unit_price).toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-red-500 block md:table-cell flex justify-between items-center">
                          <span className="md:hidden font-semibold text-slate-500">Desc:</span>
                          <span>{parseFloat(item.discount) > 0 ? `-S/.${parseFloat(item.discount).toFixed(2)}` : '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold block md:table-cell flex justify-between items-center md:text-right">
                          <span className="md:hidden font-semibold text-slate-500">Subtotal:</span>
                          <span>S/.{parseFloat(item.subtotal).toFixed(2)}</span>
                        </td>
                        {isBorrador && (
                          <td className="px-4 py-3 text-right block md:table-cell flex justify-between md:justify-end items-center border-t md:border-t-0 pt-2 md:pt-0">
                            <span className="md:hidden font-semibold text-slate-500">Acciones:</span>
                            <button onClick={() => removeInvoiceItem.mutate({ invoiceId: id, itemId: item.id })} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 p-4 border-t flex justify-end">
              <div className="w-full md:w-64">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>S/.{parseFloat(invoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Impuestos:</span>
                  <span>S/.{parseFloat(invoice.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-slate-800 mt-2 pt-2 border-t">
                  <span>TOTAL:</span>
                  <span>S/.{parseFloat(invoice.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
             <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" /> Pagos
              </h3>
              {canReceivePayment && (
                <button onClick={() => setIsAddPaymentOpen(true)} className="flex items-center gap-1 text-sm bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded font-semibold hover:bg-emerald-200">
                  <Plus className="w-4 h-4" /> Registrar Pago
                </button>
              )}
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm block md:table">
                 <thead className="hidden md:table-header-group bg-slate-50 text-slate-500">
                   <tr>
                     <th className="px-4 py-2">Fecha</th>
                     <th className="px-4 py-2">Método</th>
                     <th className="px-4 py-2">Ref</th>
                     <th className="px-4 py-2 text-right">Monto</th>
                   </tr>
                 </thead>
                 <tbody className="block md:table-row-group divide-y divide-slate-100">
                   {invoice.payments.length === 0 ? (
                     <tr className="block md:table-row"><td colSpan={4} className="px-4 py-8 text-center text-slate-400 block md:table-cell">Sin pagos registrados</td></tr>
                   ) : (
                     invoice.payments.map(p => (
                       <tr key={p.id} className="block md:table-row border-b md:border-b-0 py-2.5 md:py-0 space-y-1.5 md:space-y-0">
                         <td className="px-4 py-3 block md:table-cell flex justify-between items-center">
                           <span className="md:hidden font-semibold text-slate-500">Fecha:</span>
                           <span>{format(new Date(p.payment_date), 'dd/MM/yyyy HH:mm')}</span>
                         </td>
                         <td className="px-4 py-3 block md:table-cell flex justify-between items-center">
                           <span className="md:hidden font-semibold text-slate-500">Método:</span>
                           <span>{p.payment_method_name}</span>
                         </td>
                         <td className="px-4 py-3 text-slate-500 block md:table-cell flex justify-between items-center">
                           <span className="md:hidden font-semibold text-slate-500">Ref:</span>
                           <span>{p.reference_number || '-'}</span>
                         </td>
                         <td className="px-4 py-3 text-right font-bold text-emerald-600 block md:table-cell flex justify-between items-center md:text-right">
                           <span className="md:hidden font-semibold text-slate-500">Monto:</span>
                            <span>S/.{parseFloat(p.amount).toFixed(2)}</span>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
              </table>
              <div className="bg-slate-50 p-4 border-t flex justify-end">
                <div className="w-full md:w-64">
                   <div className="flex justify-between font-bold text-slate-700">
                      <span>Total Pagado:</span>
                       <span className="text-emerald-600">S/.{totalPagado.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between font-bold text-slate-700 mt-1">
                      <span>Saldo Pendiente:</span>
                       <span className="text-amber-600">S/.{Math.max(0, saldoPendiente).toFixed(2)}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Acciones</h3>
            <div className="space-y-3">
              {isBorrador && (
                <button onClick={handleEmit} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition">
                  <CheckCircle className="w-5 h-5" /> Emitir Factura
                </button>
              )}
              <button
                onClick={handleDownloadPdf}
                disabled={isPdfLoading}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white py-2 rounded-md font-semibold hover:bg-slate-800 transition disabled:opacity-50"
              >
                {isPdfLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
                  : <><Download className="w-4 h-4" /> Descargar PDF</>
                }
              </button>
              {invoice.status !== 'anulada' && (
                <button onClick={handleCancel} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-md font-semibold hover:bg-red-100 transition">
                  <Ban className="w-5 h-5" /> Anular Factura
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {isAddItemOpen && <AddItemModal invoiceId={id} onClose={() => setIsAddItemOpen(false)} />}
      {isAddPaymentOpen && <AddPaymentModal invoiceId={id} maxAmount={saldoPendiente} onClose={() => setIsAddPaymentOpen(false)} />}
    </div>
  );
}

function AddItemModal({ invoiceId, onClose }) {
  const addInvoiceItem = useAddInvoiceItem();
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [itemType, setItemType] = useState('producto');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addInvoiceItem.mutateAsync({
        invoiceId,
        data: { item_type: itemType, description, quantity: Number(quantity), unit_price: Number(unitPrice) }
      });
      toast.success('Ítem agregado');
      onClose();
    } catch (e) { toast.error('Error al agregar ítem'); }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-[400px]">
        <h3 className="font-bold text-lg mb-4 border-b pb-2">Agregar Ítem</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
            <label className="block text-sm mb-1">Tipo</label>
            <select value={itemType} onChange={e=>setItemType(e.target.value)} className="w-full border p-2 rounded">
              <option value="producto">Producto</option>
              <option value="servicio_medico">Servicio Médico</option>
              <option value="estetica">Estética</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Descripción</label>
            <input required value={description} onChange={e=>setDescription(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div className="flex gap-4">
             <div className="flex-1">
               <label className="block text-sm mb-1">Cantidad</label>
               <input type="number" min="0.1" step="0.1" required value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full border p-2 rounded" />
             </div>
             <div className="flex-1">
               <label className="block text-sm mb-1">P. Unitario</label>
               <input type="number" min="0" step="0.01" required value={unitPrice} onChange={e=>setUnitPrice(e.target.value)} className="w-full border p-2 rounded" />
             </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
             <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
             <button type="submit" disabled={addInvoiceItem.isPending} className="px-4 py-2 bg-blue-600 text-white rounded">Agregar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddPaymentModal({ invoiceId, maxAmount, onClose }) {
  const registerPayment = useRegisterPayment();
  const { data: methods = [] } = usePaymentMethods();
  const [amount, setAmount] = useState(maxAmount);
  const [methodId, setMethodId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!methodId) return toast.error('Selecciona un método de pago');
    try {
      await registerPayment.mutateAsync({
        invoiceId,
        data: { amount: Number(amount), payment_method_id: methodId }
      });
      toast.success('Pago registrado');
      onClose();
    } catch (e) { toast.error('Error al registrar pago'); }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-[400px]">
        <h3 className="font-bold text-lg mb-4 border-b pb-2">Registrar Pago</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
            <label className="block text-sm mb-1">Monto (Máximo: S/.{maxAmount.toFixed(2)})</label>
            <input type="number" max={maxAmount} step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)} className="w-full border p-2 rounded text-lg font-bold text-emerald-600" />
          </div>
          <div>
            <label className="block text-sm mb-1">Método de Pago</label>
            <select required value={methodId} onChange={e=>setMethodId(e.target.value)} className="w-full border p-2 rounded">
              <option value="">-- Seleccionar --</option>
              {methods.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
             <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
             <button type="submit" disabled={registerPayment.isPending} className="px-4 py-2 bg-emerald-600 text-white rounded">Procesar Pago</button>
          </div>
        </form>
      </div>
    </div>
  );
}
