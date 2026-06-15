import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResetPassword } from './useStaff';
import toast from 'react-hot-toast';
import { X, Lock } from 'lucide-react';

const schema = z.object({
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(8, 'La confirmación debe tener al menos 8 caracteres'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export default function ResetPasswordModal({ staffId, staffName, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    }
  });

  const resetMutation = useResetPassword();

  const onSubmit = async (data) => {
    try {
      await resetMutation.mutateAsync({
        id: staffId,
        data: { new_password: data.newPassword }
      });
      toast.success(`Contraseña para ${staffName} restablecida correctamente`);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Error al restablecer la contraseña');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2 text-slate-800">
            <Lock className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold">Restablecer Contraseña</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="bg-amber-50/50 border-b border-amber-100 px-6 py-3 text-sm text-slate-600">
          Estás cambiando la contraseña de: <strong>{staffName}</strong>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nueva Contraseña *</label>
            <input 
              {...register('newPassword')} 
              type="password"
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm" 
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar Nueva Contraseña *</label>
            <input 
              {...register('confirmPassword')} 
              type="password"
              placeholder="Repita la nueva contraseña"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm" 
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm disabled:opacity-50 flex items-center justify-center animate-pulse-once"
            >
              {isSubmitting ? 'Actualizando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
