import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateStaff, useUpdateStaff } from './useStaff';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const createSchema = z.object({
  full_name: z.string().min(1, 'El nombre completo es requerido'),
  email: z.string().email('Formato de correo inválido').min(1, 'El correo electrónico es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  role_name: z.enum(['veterinario', 'groomer', 'recepcionista'], {
    errorMap: () => ({ message: 'Debe seleccionar un rol válido' })
  }),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(8, 'La confirmación debe tener al menos 8 caracteres')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

const editSchema = z.object({
  full_name: z.string().min(1, 'El nombre completo es requerido'),
  email: z.string().email('Formato de correo inválido').min(1, 'El correo electrónico es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  role_name: z.enum(['veterinario', 'groomer', 'recepcionista'], {
    errorMap: () => ({ message: 'Debe seleccionar un rol válido' })
  })
});

export default function StaffForm({ initialData = null, onClose, onSuccess }) {
  const isEditing = !!initialData;
  const currentSchema = isEditing ? editSchema : createSchema;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      role_name: initialData?.role_name || '',
      password: '',
      confirmPassword: '',
    }
  });

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: {
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            role_name: data.role_name
          }
        });
        toast.success('Usuario actualizado correctamente');
      } else {
        await createMutation.mutateAsync({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          role_name: data.role_name,
          password: data.password
        });
        toast.success(
          (t) => (
            <div className="flex flex-col space-y-1">
              <span className="font-bold text-slate-800">Usuario creado correctamente.</span>
              <span className="text-xs text-slate-600">Credenciales para el empleado:</span>
              <div className="bg-slate-100 p-2 rounded text-xs select-all font-mono border mt-1">
                <strong>Email:</strong> {data.email} <br />
                <strong>Contraseña:</strong> {data.password}
              </div>
            </div>
          ),
          { duration: 10000 } // Mostrar por 10 segundos para dar tiempo de copiar
        );
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Error al guardar el usuario de personal');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            {isEditing ? 'Editar Datos de Personal' : 'Registrar Nuevo Personal'}
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo *</label>
            <input 
              {...register('full_name')} 
              placeholder="Ej. Juan Pérez"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm" 
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
            <input 
              {...register('email')} 
              type="email"
              placeholder="juan.perez@vetpets.com"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm" 
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono *</label>
            <input 
              {...register('phone')} 
              placeholder="Ej. +51 987 654 321"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm" 
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Rol Asignado *</label>
            <select 
              {...register('role_name')} 
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm"
            >
              <option value="">-- Seleccionar Rol --</option>
              <option value="veterinario">Veterinario</option>
              <option value="groomer">Groomer</option>
              <option value="recepcionista">Recepcionista</option>
            </select>
            {errors.role_name && <p className="text-red-500 text-xs mt-1">{errors.role_name.message}</p>}
          </div>

          {/* Password fields only shown during creation */}
          {!isEditing && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña *</label>
                <input 
                  {...register('password')} 
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm" 
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar Contraseña *</label>
                <input 
                  {...register('confirmPassword')} 
                  type="password"
                  placeholder="Repita la contraseña"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm" 
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          )}

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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
