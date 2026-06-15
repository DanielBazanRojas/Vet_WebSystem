import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAddLabResult } from './useConsultations';

const schema = z.object({
  exam_type: z.string().min(1, 'El tipo de examen es requerido'),
  exam_date: z.string().optional(),
  description: z.string().optional(),
  result: z.string().optional(),
});

export default function LabResultForm({ consultationId, onClose }) {
  const mutation = useAddLabResult();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      exam_type: '',
      exam_date: new Date().toISOString().split('T')[0],
      description: '',
      result: '',
    }
  });

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
          maxWidth: '480px',
          padding: '24px',
          border: '1px solid #cbd5e1'
        }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          Agregar Resultado de Laboratorio
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700">Tipo de Examen *</label>
            <input
              type="text"
              {...register('exam_type')}
              placeholder="Ej. Hemograma completo, Urianálisis, Radiografía..."
              className="w-full mt-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.exam_type && <span className="text-red-500 text-xs">{errors.exam_type.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Fecha del Examen</label>
            <input
              type="date"
              {...register('exam_date')}
              className="w-full mt-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Descripción / Hallazgos</label>
            <textarea
              {...register('description')}
              rows="3"
              placeholder="Descripción del procedimiento o hallazgos generales..."
              className="w-full mt-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Resultado / Interpretación</label>
            <textarea
              {...register('result')}
              rows="3"
              placeholder="Valores obtenidos, interpretación clínica o conclusión..."
              className="w-full mt-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-500"
            />
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
              disabled={isSubmitting || mutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar Resultado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
