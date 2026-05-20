import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateConsultation } from './useConsultations';
import useAuthStore from '../../store/authStore';

const schema = z.object({
  veterinarian_id: z.string().min(1, 'El veterinario es requerido'),
  weight_kg: z.string().transform(v => v === '' ? null : Number(v)).nullable(),
  temperature_c: z.string().transform(v => v === '' ? null : Number(v)).nullable(),
  heart_rate_bpm: z.string().transform(v => v === '' ? null : Number(v)).nullable(),
  respiratory_rate: z.string().transform(v => v === '' ? null : Number(v)).nullable(),
  mucosal_color: z.string().optional(),
  chief_complaint: z.string().optional(),
  anamnesis: z.string().optional(),
  physical_exam: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  follow_up_date: z.string().optional(),
  is_emergency: z.boolean().default(false),
});

export default function ConsultationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  // petId and appointmentId can come from navigation state
  const petId = location.state?.petId;
  const appointmentId = location.state?.appointmentId;

  const createMutation = useCreateConsultation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      veterinarian_id: user?.id || '',
      weight_kg: '',
      temperature_c: '',
      heart_rate_bpm: '',
      respiratory_rate: '',
      mucosal_color: '',
      chief_complaint: '',
      anamnesis: '',
      physical_exam: '',
      diagnosis: '',
      treatment_plan: '',
      follow_up_date: '',
      is_emergency: false,
    }
  });

  const onSubmit = async (data) => {
    if (!petId) return;

    createMutation.mutate({
      pet_id: petId,
      appointment_id: appointmentId || null,
      ...data
    }, {
      onSuccess: (res) => {
        navigate(`/consultations/${res.id}`);
      }
    });
  };

  if (!petId) {
    return (
      <div className="p-6 text-center text-red-600">
        Error: No se ha proporcionado la mascota para esta consulta.
        <button onClick={() => navigate(-1)} className="mt-4 block mx-auto text-blue-600 hover:underline">Volver</button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Nueva Consulta Médica</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Signos Vitales */}
        <div className="border border-slate-100 p-4 rounded-md bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Signos Vitales</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Peso (kg)</label>
              <input type="number" step="0.01" {...register('weight_kg')} className="w-full mt-1 px-3 py-2 text-sm border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Temp (°C)</label>
              <input type="number" step="0.1" {...register('temperature_c')} className="w-full mt-1 px-3 py-2 text-sm border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">FC (lpm)</label>
              <input type="number" {...register('heart_rate_bpm')} className="w-full mt-1 px-3 py-2 text-sm border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">FR (rpm)</label>
              <input type="number" {...register('respiratory_rate')} className="w-full mt-1 px-3 py-2 text-sm border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Mucosas</label>
              <input type="text" {...register('mucosal_color')} className="w-full mt-1 px-3 py-2 text-sm border rounded-md" />
            </div>
          </div>
        </div>

        {/* Sección Clínica */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b pb-2">Información Clínica</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Motivo de consulta (Enfermedad actual)</label>
            <textarea {...register('chief_complaint')} rows="2" className="w-full mt-1 px-3 py-2 border rounded-md"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Anamnesis (Historia clínica previa)</label>
            <textarea {...register('anamnesis')} rows="3" className="w-full mt-1 px-3 py-2 border rounded-md"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Examen Físico</label>
            <textarea {...register('physical_exam')} rows="3" className="w-full mt-1 px-3 py-2 border rounded-md"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Diagnóstico (Presuntivo o definitivo)</label>
            <textarea {...register('diagnosis')} rows="2" className="w-full mt-1 px-3 py-2 border rounded-md bg-blue-50"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Plan de Tratamiento</label>
            <textarea {...register('treatment_plan')} rows="3" className="w-full mt-1 px-3 py-2 border rounded-md"></textarea>
          </div>
        </div>

        {/* Cita y Seguimiento */}
        <div className="flex flex-wrap gap-6 items-center border-t pt-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="is_emergency" {...register('is_emergency')} className="w-4 h-4 text-red-600 rounded" />
            <label htmlFor="is_emergency" className="text-sm font-medium text-red-600">Es una urgencia médica</label>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700">Fecha de seguimiento recomendada</label>
            <input type="date" {...register('follow_up_date')} className="w-full mt-1 px-3 py-2 border rounded-md" />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? 'Guardando...' : 'Crear Consulta'}
          </button>
        </div>

      </form>
    </div>
  );
}
