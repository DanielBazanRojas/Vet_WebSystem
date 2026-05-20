import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import { useRegisterVaccine, useVaccinesCatalog } from './useConsultations';

const schema = z.object({
  vaccine_id: z.string().min(1, 'La vacuna es requerida'),
  administered_date: z.string().min(1, 'La fecha es requerida'),
  batch_number: z.string().optional(),
  next_dose_date: z.string().optional(),
  dosage: z.string().optional(),
  notes: z.string().optional(),
});

export default function VaccineForm({ consultationId, onClose }) {
  const mutation = useRegisterVaccine();
  const { data: vaccines = [], isLoading } = useVaccinesCatalog();

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      vaccine_id: '',
      administered_date: new Date().toISOString().split('T')[0],
      batch_number: '',
      next_dose_date: '',
      dosage: '',
      notes: ''
    }
  });

  const vaccineOptions = vaccines.map(v => ({
    value: v.id,
    label: `${v.name} (${v.disease_target})`
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
          maxWidth: '448px',
          padding: '24px',
          border: '1px solid #cbd5e1'
        }}
      >
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>Registrar Vacuna</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Vacuna *</label>
              <Controller
                name="vaccine_id"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={vaccineOptions}
                    isLoading={isLoading}
                    placeholder="Seleccionar vacuna..."
                    noOptionsMessage={() => "No se encontraron vacunas"}
                    value={vaccineOptions.find(c => c.value === field.value) || null}
                    onChange={val => field.onChange(val ? val.value : '')}
                    className="mt-1"
                  />
                )}
              />
              {errors.vaccine_id && <span className="text-red-500 text-xs">{errors.vaccine_id.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Fecha Admin.</label>
                <input type="date" {...register('administered_date')} className="w-full mt-1 px-3 py-2 border rounded-md" />
                {errors.administered_date && <span className="text-red-500 text-xs">{errors.administered_date.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Próxima Dosis</label>
                <input type="date" {...register('next_dose_date')} className="w-full mt-1 px-3 py-2 border rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Lote</label>
                <input type="text" {...register('batch_number')} placeholder="Ej. L-1234" className="w-full mt-1 px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Dosis</label>
                <input type="text" {...register('dosage')} placeholder="Ej. 1ml" className="w-full mt-1 px-3 py-2 border rounded-md" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Notas Adicionales</label>
              <textarea {...register('notes')} rows="2" className="w-full mt-1 px-3 py-2 border rounded-md"></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {isSubmitting ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
