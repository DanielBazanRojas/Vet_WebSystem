import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateFeedback } from './useFeedback';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const schema = z.object({
  type: z.enum(['sugerencia', 'error', 'otro'], {
    errorMap: () => ({ message: 'Debe seleccionar un tipo' }),
  }),
  title: z.string().min(1, 'El título es requerido').max(150, 'Máximo 150 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
});

export default function FeedbackForm({ onClose, onSuccess }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: '', title: '', description: '' },
  });

  const titleValue = watch('title', '');
  const createMutation = useCreateFeedback();

  const onSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Feedback enviado correctamente');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar feedback');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Enviar Feedback</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo *</label>
            <select {...register('type')} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm">
              <option value="">-- Seleccionar --</option>
              <option value="sugerencia">Sugerencia</option>
              <option value="error">Reporte de error</option>
              <option value="otro">Otro</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Título *</label>
            <input {...register('title')} placeholder="Resumen breve del feedback" maxLength={150} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm" />
            <div className="flex justify-between mt-1">
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
              <span className="text-xs text-slate-400 ml-auto">{titleValue.length}/150</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción *</label>
            <textarea {...register('description')} rows={4} placeholder="Describe tu sugerencia o reporte en detalle (mín. 20 caracteres)" className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm resize-none" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm disabled:opacity-50">
              {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
