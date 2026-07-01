import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateFollowup, useUpdateFollowup } from './useConsultations';

const schema = z.object({
  followup_date: z.string().min(1, 'La fecha y hora es requerida'),
  weight_kg: z.string().transform((val) => (val === '' ? null : parseFloat(val))).nullable().optional(),
  temperature_c: z.string().transform((val) => (val === '' ? null : parseFloat(val))).nullable().optional(),
  evolution: z.string().min(1, 'La evolución es requerida'),
  indications: z.string().optional(),
  next_followup_date: z.string().optional(),
  requires_attention: z.boolean().default(false),
});

export default function FollowupForm({ consultationId, followup, onClose }) {
  const isEdit = !!followup;
  const createMutation = useCreateFollowup();
  const updateMutation = useUpdateFollowup();

  // Helper to format date for datetime-local input
  const formatDatetimeLocal = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      followup_date: followup ? formatDatetimeLocal(followup.followup_date) : formatDatetimeLocal(new Date().toISOString()),
      weight_kg: followup?.weight_kg !== null && followup?.weight_kg !== undefined ? String(followup.weight_kg) : '',
      temperature_c: followup?.temperature_c !== null && followup?.temperature_c !== undefined ? String(followup.temperature_c) : '',
      evolution: followup?.evolution || '',
      indications: followup?.indications || '',
      next_followup_date: followup?.next_followup_date ? followup.next_followup_date.split('T')[0] : '',
      requires_attention: followup?.requires_attention || false,
    }
  });

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      weight_kg: data.weight_kg === '' || data.weight_kg === null ? null : parseFloat(data.weight_kg),
      temperature_c: data.temperature_c === '' || data.temperature_c === null ? null : parseFloat(data.temperature_c),
      next_followup_date: data.next_followup_date === '' ? null : data.next_followup_date,
    };

    if (isEdit) {
      updateMutation.mutate(
        { consultationId, followupId: followup.id, data: formattedData },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(
        { consultationId, data: formattedData },
        { onSuccess: onClose }
      );
    }
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
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          border: '1px solid #cbd5e1'
        }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          {isEdit ? 'Editar Seguimiento' : 'Agregar Seguimiento'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Fecha y Hora *</label>
            <input
              type="datetime-local"
              {...register('followup_date')}
              className="w-full mt-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.followup_date && <span className="text-red-500 text-xs">{errors.followup_date.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Peso (kg)</label>
              <input
                type="number"
                step="0.01"
                {...register('weight_kg')}
                placeholder="Ej. 12.5"
                className="w-full mt-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.weight_kg && <span className="text-red-500 text-xs">{errors.weight_kg.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Temperatura (°C)</label>
              <input
                type="number"
                step="0.1"
                {...register('temperature_c')}
                placeholder="Ej. 38.5"
                className="w-full mt-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.temperature_c && <span className="text-red-500 text-xs">{errors.temperature_c.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Evolución *</label>
            <textarea
              {...register('evolution')}
              rows="4"
              placeholder="Describa la evolución clínica de la mascota..."
              className="w-full mt-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.evolution && <span className="text-red-500 text-xs">{errors.evolution.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Indicaciones para el dueño</label>
            <textarea
              {...register('indications')}
              rows="3"
              placeholder="Nuevas indicaciones de cuidado o tratamiento..."
              className="w-full mt-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Próxima Fecha de Seguimiento</label>
              <input
                type="date"
                {...register('next_followup_date')}
                className="w-full mt-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 py-2">
            <input
              type="checkbox"
              id="requires_attention"
              {...register('requires_attention')}
              className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="requires_attention" className="text-sm font-medium text-slate-700">
              Requiere atención urgente
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-slate-50 text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar Seguimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
