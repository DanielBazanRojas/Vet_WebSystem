import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import { useAddTreatment, useProductsCatalog } from './useConsultations';

const schema = z.object({
  product_id: z.string().optional().nullable(),
  treatment_type: z.string().min(1, 'Tipo de tratamiento es requerido'),
  description: z.string().optional(),
  dose: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  quantity_used: z.number().min(0).default(0),
  instructions: z.string().optional(),
});

export default function TreatmentForm({ consultationId, onClose }) {
  const mutation = useAddTreatment();
  const { data: products = [], isLoading: isLoadingProducts } = useProductsCatalog();

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: null,
      treatment_type: '',
      description: '',
      dose: '',
      frequency: '',
      duration: '',
      quantity_used: 0,
      instructions: ''
    }
  });

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.name} (Stock: ${p.current_stock} ${p.unit_of_measure})`
  }));

  const onSubmit = (data) => {
    mutation.mutate(
      { consultationId, data },
      { onSuccess: onClose }
    );
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '576px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          border: '1px solid #cbd5e1'
        }}
      >
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>Agregar Tratamiento</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Tipo de Tratamiento *</label>
              <select {...register('treatment_type')} className="w-full mt-1 px-3 py-2 border rounded-md">
                <option value="">Seleccione...</option>
                <option value="medicamento">Medicamento (con stock)</option>
                <option value="procedimiento">Procedimiento médico</option>
                <option value="aplicacion">Aplicación clínica</option>
                <option value="otro">Otro</option>
              </select>
              {errors.treatment_type && <span className="text-red-500 text-xs">{errors.treatment_type.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Producto / Fármaco (Opcional)</label>
              <Controller
                name="product_id"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={productOptions}
                    isLoading={isLoadingProducts}
                    isClearable
                    placeholder="Buscar producto..."
                    noOptionsMessage={() => "No se encontraron productos"}
                    value={productOptions.find(c => c.value === field.value) || null}
                    onChange={val => field.onChange(val ? val.value : null)}
                    className="mt-1"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Dosis</label>
                <input type="text" {...register('dose')} placeholder="Ej. 1 tableta, 2ml..." className="w-full mt-1 px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Frecuencia</label>
                <input type="text" {...register('frequency')} placeholder="Ej. Cada 8 horas" className="w-full mt-1 px-3 py-2 border rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Duración</label>
                <input type="text" {...register('duration')} placeholder="Ej. 5 días" className="w-full mt-1 px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Cantidad usada (clínica)</label>
                <input type="number" step="0.01" {...register('quantity_used', { valueAsNumber: true })} className="w-full mt-1 px-3 py-2 border rounded-md" />
                <p className="text-xs text-slate-500 mt-1">Se descontará del inventario si selecciona un producto.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Descripción general</label>
              <textarea {...register('description')} rows="2" className="w-full mt-1 px-3 py-2 border rounded-md"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Instrucciones para el cliente</label>
              <textarea {...register('instructions')} rows="2" className="w-full mt-1 px-3 py-2 border rounded-md"></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {isSubmitting ? 'Guardando...' : 'Guardar Tratamiento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
