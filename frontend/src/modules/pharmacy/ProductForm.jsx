import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProduct, useCategories } from './usePharmacy';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  sku: z.string().optional(),
  category_id: z.string().uuid('Categoría inválida').optional().or(z.literal('')),
  description: z.string().optional(),
  unit_of_measure: z.string().default('unidad'),
  sale_price: z.coerce.number().min(0, 'No puede ser negativo').default(0),
  cost_price: z.coerce.number().min(0, 'No puede ser negativo').default(0),
  min_stock_alert: z.coerce.number().min(0).default(5),
  is_medicine: z.boolean().default(false),
  requires_prescription: z.boolean().default(false),
  is_for_sale: z.boolean().default(true),
});

export default function ProductForm({ onClose }) {
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', sku: '', category_id: '', description: '',
      unit_of_measure: 'unidad', sale_price: 0, cost_price: 0, min_stock_alert: 5,
      is_medicine: false, requires_prescription: false, is_for_sale: true
    }
  });

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      if (!payload.category_id) payload.category_id = null;
      await createProduct.mutateAsync(payload);
      toast.success('Producto creado exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al crear el producto');
      console.error(error);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold">Nuevo Producto / Medicamento</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
              <input {...register('name')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Código</label>
              <input {...register('sku')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select {...register('category_id')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sin categoría --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea {...register('description')} rows={2} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio Compra</label>
              <input type="number" step="0.01" {...register('cost_price')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio Venta *</label>
              <input type="number" step="0.01" {...register('sale_price')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alerta Stock Mínimo *</label>
              <input type="number" {...register('min_stock_alert')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidad de Medida</label>
              <input {...register('unit_of_measure')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex gap-6 py-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" {...register('is_medicine')} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Es Medicamento
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" {...register('requires_prescription')} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Requiere Receta
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" {...register('is_for_sale')} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Para Venta
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
