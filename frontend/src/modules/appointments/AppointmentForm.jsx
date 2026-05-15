import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useCreateAppointment, useUpdateAppointment, useAppointmentTypes, useStaff } from './useAppointments';
import { getPets } from '../pets/pets.api';
import toast from 'react-hot-toast';

const schema = z.object({
  pet_id: z.string().min(1, 'La mascota es requerida'),
  client_id: z.string().min(1, 'El cliente es requerido'),
  appointment_type_id: z.string().min(1, 'El tipo de cita es requerido'),
  assigned_to: z.string().min(1, 'El profesional es requerido'),
  scheduled_date: z.string().min(1, 'La fecha es requerida'),
  scheduled_time: z.string().min(1, 'La hora es requerida'),
  duration_min: z.number().min(5, 'Duración mínima 5 min').max(480, 'Duración máxima 8 hrs'),
  notes: z.string().optional(),
});

export default function AppointmentForm({ initialData, initialDate, initialTime, onSuccess, onCancel }) {
  const { data: types = [] } = useAppointmentTypes();
  const { data: staff = [] } = useStaff();

  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();

  const [selectedPetOption, setSelectedPetOption] = useState(
    initialData?.pet_id && initialData?.pet_name
      ? { value: initialData.pet_id, label: `${initialData.pet_name} (${initialData.client_name})`, client_id: initialData.client_id }
      : null
  );

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pet_id: initialData?.pet_id || '',
      client_id: initialData?.client_id || '',
      appointment_type_id: initialData?.appointment_type_id || '',
      assigned_to: initialData?.assigned_to_id || '',
      scheduled_date: initialData?.scheduled_date ? initialData.scheduled_date.substring(0, 10) : (initialDate || ''),
      scheduled_time: initialData?.scheduled_time ? initialData.scheduled_time.substring(0, 5) : (initialTime || ''),
      duration_min: initialData?.duration_min || 30,
      notes: initialData?.notes || '',
    }
  });

  const watchTypeId = watch('appointment_type_id');

  // Actualizar duración por defecto cuando cambia el tipo
  const handleTypeChange = (e) => {
    const typeId = e.target.value;
    setValue('appointment_type_id', typeId);
    const type = types.find(t => t.id === typeId);
    if (type) {
      setValue('duration_min', type.default_duration_min);
    }
  };

  const loadPetOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const res = await getPets({ search: inputValue, page: 1, limit: 10 });
      return (res.data || []).map(p => ({
        value: p.id,
        label: `${p.name} (Dueño: ${p.client_name})`,
        client_id: p.client_id
      }));
    } catch {
      return [];
    }
  };

  const onSubmit = async (data) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data });
        toast.success('Cita actualizada');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Cita agendada');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar la cita');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Mascota *</label>
        <Controller
          name="pet_id"
          control={control}
          render={({ field }) => (
            <AsyncSelect
              cacheOptions
              defaultOptions={false}
              loadOptions={loadPetOptions}
              placeholder="Escribe para buscar mascota..."
              noOptionsMessage={() => "No se encontraron mascotas"}
              loadingMessage={() => "Buscando..."}
              onChange={(option) => {
                field.onChange(option ? option.value : '');
                setValue('client_id', option ? option.client_id : ''); // Asigna automáticamente el cliente
                setSelectedPetOption(option);
              }}
              value={selectedPetOption}
              className="text-sm react-select-container"
              classNamePrefix="react-select"
              isDisabled={!!initialData} // No permitir cambiar mascota si se está editando la cita
            />
          )}
        />
        {errors.pet_id && <p className="text-red-500 text-xs mt-1">{errors.pet_id.message}</p>}
        {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Tipo de cita *</label>
          <select {...register('appointment_type_id')} onChange={handleTypeChange} className="w-full mt-1 px-3 py-2 border rounded-md bg-white">
            <option value="">Seleccione tipo...</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {errors.appointment_type_id && <p className="text-red-500 text-xs mt-1">{errors.appointment_type_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Profesional *</label>
          <select {...register('assigned_to')} className="w-full mt-1 px-3 py-2 border rounded-md bg-white">
            <option value="">Seleccione profesional...</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.roles})</option>)}
          </select>
          {errors.assigned_to && <p className="text-red-500 text-xs mt-1">{errors.assigned_to.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Fecha *</label>
          <input type="date" {...register('scheduled_date')} className="w-full mt-1 px-3 py-2 border rounded-md" />
          {errors.scheduled_date && <p className="text-red-500 text-xs mt-1">{errors.scheduled_date.message}</p>}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700">Hora *</label>
            <input type="time" {...register('scheduled_time')} className="w-full mt-1 px-3 py-2 border rounded-md" />
            {errors.scheduled_time && <p className="text-red-500 text-xs mt-1">{errors.scheduled_time.message}</p>}
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium text-slate-700">Minutos</label>
            <input type="number" {...register('duration_min', { valueAsNumber: true })} className="w-full mt-1 px-3 py-2 border rounded-md" />
            {errors.duration_min && <p className="text-red-500 text-xs mt-1">{errors.duration_min.message}</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Notas / Motivo</label>
        <textarea {...register('notes')} className="w-full mt-1 px-3 py-2 border rounded-md" rows="3"></textarea>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50 transition">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition">
          {isSubmitting ? 'Guardando...' : 'Guardar Cita'}
        </button>
      </div>
    </form>
  );
}
