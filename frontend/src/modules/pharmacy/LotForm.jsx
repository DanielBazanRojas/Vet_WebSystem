import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterLot } from './usePharmacy';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const schema = z.object({
  lot_number: z.string().min(1, 'Número de lote requerido'),
  expiry_date: z.string().min(1, 'Fecha de caducidad requerida'),
  quantity_received: z.coerce.number().min(0.01, 'Cantidad debe ser mayor a 0'),
  unit_cost: z.coerce.number().min(0, 'Costo no puede ser negativo').default(0),
  supplier: z.string().optional(),
  notes: z.string().optional()
});

export default function LotForm({ product, onClose }) {
  const registerLot = useRegisterLot();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      lot_number: '', expiry_date: '', quantity_received: '', unit_cost: product.cost_price || 0, supplier: '', notes: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      await registerLot.mutateAsync({ id: product.id, data });
      toast.success('Entrada de lote registrada');
      onClose();
    } catch (error) {
      toast.error('Error al registrar la entrada');
      console.error(error);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold">Registrar Entrada / Lote</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded text-blue-800 text-sm">
          <strong>Producto:</strong> {product.name} <br/>
          <strong>Stock Actual:</strong> {product.current_stock}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nº Lote *</label>
              <input {...register('lot_number')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.lot_number && <p className="text-red-500 text-xs mt-1">{errors.lot_number.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">F. Caducidad *</label>
              <input type="date" {...register('expiry_date')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.expiry_date && <p className="text-red-500 text-xs mt-1">{errors.expiry_date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad Recibida *</label>
              <input type="number" step="0.01" {...register('quantity_received')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.quantity_received && <p className="text-red-500 text-xs mt-1">{errors.quantity_received.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Costo Unitario</label>
              <input type="number" step="0.01" {...register('unit_cost')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
              <input {...register('supplier')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notas del Movimiento</label>
              <textarea {...register('notes')} rows={2} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. Compra regular de almacén" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition disabled:opacity-50">
              {isSubmitting ? 'Registrando...' : 'Registrar Entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
