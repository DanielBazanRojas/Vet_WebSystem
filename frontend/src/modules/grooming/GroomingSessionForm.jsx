import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSession } from './useGrooming';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import Select from 'react-select';

const schema = z.object({
  pet_id: z.string().uuid('Mascota requerida'),
  groomer_id: z.string().uuid('Estilista requerido').optional().or(z.literal('')),
  session_date: z.string().min(1, 'Fecha/Hora requerida'),
  special_care_notes: z.string().optional(),
  notes: z.string().optional()
});

export default function GroomingSessionForm({ onClose }) {
  const createSession = useCreateSession();

  const { data: petsRes } = useQuery({
    queryKey: ['pets_list'],
    queryFn: () => client.get('/pets?limit=100').then(res => res.data)
  });
  
  const { data: staffRes } = useQuery({
    queryKey: ['staff_list'],
    queryFn: () => client.get('/appointments/staff').then(res => res.data)
  });

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pet_id: '',
      groomer_id: '',
      session_date: new Date().toISOString().slice(0, 16),
      special_care_notes: '',
      notes: ''
    }
  });

  const petOptions = petsRes?.data?.map(p => ({ value: p.id, label: `${p.name} - ${p.client_name}` })) || [];
  const groomerOptions = staffRes?.map(s => ({ value: s.id, label: s.full_name })) || [];

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      if (!payload.groomer_id) delete payload.groomer_id;
      await createSession.mutateAsync(payload);
      toast.success('Sesión creada exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al crear la sesión');
      console.error(error);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold">Nueva Sesión Estética</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mascota *</label>
            <Select 
              options={petOptions}
              onChange={(opt) => setValue('pet_id', opt ? opt.value : '')}
              placeholder="Buscar mascota..."
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
            {errors.pet_id && <p className="text-red-500 text-xs mt-1">{errors.pet_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estilista / Groomer</label>
            <Select 
              options={groomerOptions}
              onChange={(opt) => setValue('groomer_id', opt ? opt.value : '')}
              placeholder="Asignar estilista..."
              isClearable
            />
            {errors.groomer_id && <p className="text-red-500 text-xs mt-1">{errors.groomer_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha y Hora *</label>
            <input type="datetime-local" {...register('session_date')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500" />
            {errors.session_date && <p className="text-red-500 text-xs mt-1">{errors.session_date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 text-amber-600">Advertencias / Cuidados Especiales</label>
            <textarea {...register('special_care_notes')} rows={2} className="w-full border border-amber-300 bg-amber-50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ej. Agresivo al cortar uñas, alergia al shampoo X..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas Generales</label>
            <textarea {...register('notes')} rows={2} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Crear Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
