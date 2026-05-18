import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { useCreatePet, useUpdatePet, useSpecies, useBreeds } from './usePets';
import { getClients } from '../clients/clients.api';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  species_id: z.string().min(1, 'La especie es requerida'),
  breed_id: z.string().optional(),
  client_id: z.string().min(1, 'El dueño es requerido'),
  gender: z.string().optional(),
  birth_date: z.string().optional(),
  approximate_age: z.string().optional(),
  weight_kg: z.union([z.string(), z.number()]).optional().refine(
    (v) => !v || v === '' || (Number(v) > 0),
    { message: 'El peso debe ser un número positivo' }
  ),
  color: z.string().optional(),
  microchip_number: z.string().optional(),
  is_neutered: z.boolean().optional(),
  allergies: z.string().optional(),
});

export default function PetForm({ initialData = null, preselectedClientId = null, onSuccess, onCancel }) {
  const [selectedSpecies, setSelectedSpecies] = useState(initialData?.species_id || '');
  const [selectedClientOption, setSelectedClientOption] = useState(
    initialData?.client_id && initialData?.client_name
      ? { value: initialData.client_id, label: initialData.client_name }
      : null
  );

  const { data: species = [] } = useSpecies();
  const { data: breeds = [] } = useBreeds(selectedSpecies);

  const createMutation = useCreatePet();
  const updateMutation = useUpdatePet();

  const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      species_id: initialData?.species_id || '',
      breed_id: initialData?.breed_id || '',
      client_id: preselectedClientId || initialData?.client_id || '',
      gender: initialData?.gender || 'desconocido',
      birth_date: initialData?.birth_date ? initialData.birth_date.substring(0, 10) : '',
      approximate_age: initialData?.approximate_age || '',
      weight_kg: initialData?.weight_kg || '',
      color: initialData?.color || '',
      microchip_number: initialData?.microchip_number || '',
      is_neutered: initialData?.is_neutered || false,
      allergies: initialData?.allergies || '',
    }
  });

  const watchSpecies = watch('species_id');

  useEffect(() => {
    if (watchSpecies && watchSpecies !== selectedSpecies) {
      setSelectedSpecies(watchSpecies);
      setValue('breed_id', '');
    }
  }, [watchSpecies, selectedSpecies, setValue]);

  // Carga asíncrona de clientes para el selector
  const loadClientOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const res = await getClients({ search: inputValue, page: 1, limit: 10 });
      return (res.data || []).map(c => ({
        value: c.id,
        label: `${c.full_name}`
      }));
    } catch {
      return [];
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      breed_id: data.breed_id || null,
      weight_kg: data.weight_kg ? Number(data.weight_kg) : null,
      birth_date: data.birth_date || null,
      approximate_age: data.approximate_age || null,
      color: data.color || null,
      microchip_number: data.microchip_number || null,
      allergies: data.allergies || null,
    };

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: payload });
        toast.success('Mascota actualizada correctamente');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Mascota registrada correctamente');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar la mascota');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Dueño */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Dueño *</label>
        {preselectedClientId ? (
          <div className="flex items-center space-x-2">
            <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm font-medium w-full block text-slate-600">
              {initialData?.client_name || 'Cliente preseleccionado'}
            </span>
            <input type="hidden" {...register('client_id')} />
          </div>
        ) : (
          <Controller
            name="client_id"
            control={control}
            render={({ field }) => (
              <AsyncSelect
                cacheOptions
                defaultOptions={false}
                loadOptions={loadClientOptions}
                placeholder="Escribe para buscar cliente..."
                noOptionsMessage={() => "No se encontraron clientes"}
                loadingMessage={() => "Buscando..."}
                onChange={(option) => {
                  field.onChange(option ? option.value : '');
                  setSelectedClientOption(option);
                }}
                value={selectedClientOption}
                className="text-sm react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#e2e8f0',
                    '&:hover': { borderColor: '#cbd5e1' },
                    boxShadow: 'none',
                    borderRadius: '0.375rem',
                    padding: '1px'
                  })
                }}
              />
            )}
          />
        )}
        {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre *</label>
          <input {...register('name')} className="w-full mt-1 px-3 py-2 border rounded-md" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Especie *</label>
          <select {...register('species_id')} className="w-full mt-1 px-3 py-2 border rounded-md bg-white">
            <option value="">Seleccionar especie</option>
            {species.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {errors.species_id && <p className="text-red-500 text-xs mt-1">{errors.species_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Raza</label>
          <select {...register('breed_id')} className="w-full mt-1 px-3 py-2 border rounded-md bg-white" disabled={!selectedSpecies}>
            <option value="">Mestizo / Sin raza</option>
            {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Género</label>
          <select {...register('gender')} className="w-full mt-1 px-3 py-2 border rounded-md bg-white">
            <option value="desconocido">Desconocido</option>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Fecha de nacimiento</label>
          <input type="date" {...register('birth_date')} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Edad aproximada</label>
          <input {...register('approximate_age')} placeholder="Ej: 2 años" className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Peso (kg)</label>
          <input type="number" step="0.01" {...register('weight_kg')} className="w-full mt-1 px-3 py-2 border rounded-md" />
          {errors.weight_kg && <p className="text-red-500 text-xs mt-1">{errors.weight_kg.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Color</label>
          <input {...register('color')} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Microchip</label>
          <input {...register('microchip_number')} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <input type="checkbox" {...register('is_neutered')} id="is_neutered" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <label htmlFor="is_neutered" className="text-sm text-slate-700 cursor-pointer">Esterilizado/Castrado</label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Alergias</label>
          <textarea {...register('allergies')} className="w-full mt-1 px-3 py-2 border rounded-md" rows="2" />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 transition">Cancelar</button>
        )}
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition">
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
