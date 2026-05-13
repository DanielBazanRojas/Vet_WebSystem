import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateClient, useUpdateClient } from './useClients';
import toast from 'react-hot-toast';

const schema = z.object({
  full_name: z.string().min(1, 'El nombre es requerido'),
  dni: z.string().optional(),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().min(1, 'El teléfono es requerido'),
  phone_alt: z.string().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  notes: z.string().optional(),
});

export default function ClientForm({ initialData = null, onSuccess, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      dni: initialData?.dni || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      phone_alt: initialData?.phone_alt || '',
      address: initialData?.address || '',
      district: initialData?.district || '',
      notes: initialData?.notes || '',
    }
  });

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const onSubmit = async (data) => {
    const cleanData = {
      ...data,
      email: data.email === '' ? null : data.email,
      dni: data.dni === '' ? null : data.dni,
    };

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: cleanData });
        toast.success('Cliente actualizado correctamente');
      } else {
        await createMutation.mutateAsync(cleanData);
        toast.success('Cliente creado correctamente');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el cliente');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre completo *</label>
          <input {...register('full_name')} className="w-full mt-1 px-3 py-2 border rounded-md" />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">DNI</label>
          <input {...register('dni')} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Teléfono *</label>
          <input {...register('phone')} className="w-full mt-1 px-3 py-2 border rounded-md" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Teléfono Alternativo</label>
          <input {...register('phone_alt')} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input {...register('email')} type="email" className="w-full mt-1 px-3 py-2 border rounded-md" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Distrito</label>
          <input {...register('district')} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Dirección</label>
          <input {...register('address')} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Notas</label>
          <textarea {...register('notes')} className="w-full mt-1 px-3 py-2 border rounded-md" rows="3" />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
