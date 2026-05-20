import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useConsultation } from './useConsultations';
import TreatmentForm from './TreatmentForm';
import VaccineForm from './VaccineForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronUp, AlertTriangle, ArrowLeft, Plus, FileText } from 'lucide-react';
import { useCreateInvoice } from '../billing/useBilling';
import toast from 'react-hot-toast';

const Accordion = ({ title, content, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  if (!content) return null;
  
  return (
    <div className="border border-slate-200 rounded-md mb-2 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition text-left"
      >
        <span className="font-semibold text-slate-700">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white whitespace-pre-wrap text-slate-600 text-sm">
          {content}
        </div>
      )}
    </div>
  );
};

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: consultation, isLoading, error } = useConsultation(id);
  
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);

  const createInvoice = useCreateInvoice();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando consulta...</div>;
  if (error || !consultation) return <div className="p-8 text-center text-red-500">Error al cargar la consulta</div>;

  const handleCreateInvoice = async () => {
    try {
      const invoice = await createInvoice.mutateAsync({
        client_id: consultation.client_id,
        pet_id: consultation.pet_id,
        consultation_id: consultation.id,
        notes: `Factura generada desde consulta médica para ${consultation.pet_name}`
      });
      toast.success('Factura borrador creada');
      navigate(`/facturacion/${invoice.id}`);
    } catch (error) {
      toast.error('Error al crear la factura');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Consulta de {consultation.pet_name}
            </h1>
            <p className="text-slate-500">
              {format(new Date(consultation.consultation_date), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              {' • '}
              Atendió: Dr(a). {consultation.veterinarian_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {consultation.is_emergency && (
            <div className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Urgencia
            </div>
          )}
          <button 
            onClick={handleCreateInvoice}
            disabled={createInvoice.isPending}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <FileText className="w-4 h-4" /> {createInvoice.isPending ? 'Generando...' : 'Generar Factura'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Detalles Clínicos */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Signos Vitales Card */}
          <div className="bg-white p-5 rounded-lg border shadow-sm flex flex-wrap gap-6 justify-between items-center">
            <div className="text-center">
              <span className="block text-xs text-slate-400 uppercase tracking-wider">Peso</span>
              <span className="text-lg font-semibold text-slate-700">{consultation.weight_kg ? `${consultation.weight_kg} kg` : '-'}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs text-slate-400 uppercase tracking-wider">Temp</span>
              <span className="text-lg font-semibold text-slate-700">{consultation.temperature_c ? `${consultation.temperature_c} °C` : '-'}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs text-slate-400 uppercase tracking-wider">FC</span>
              <span className="text-lg font-semibold text-slate-700">{consultation.heart_rate_bpm ? `${consultation.heart_rate_bpm} lpm` : '-'}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs text-slate-400 uppercase tracking-wider">FR</span>
              <span className="text-lg font-semibold text-slate-700">{consultation.respiratory_rate ? `${consultation.respiratory_rate} rpm` : '-'}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs text-slate-400 uppercase tracking-wider">Mucosas</span>
              <span className="text-lg font-semibold text-slate-700">{consultation.mucosal_color || '-'}</span>
            </div>
          </div>

          {/* Acordeones */}
          <div>
            <Accordion title="Motivo de Consulta y Anamnesis" content={
              <div className="space-y-4">
                {consultation.chief_complaint && <div><strong className="block text-slate-800">Motivo:</strong> {consultation.chief_complaint}</div>}
                {consultation.anamnesis && <div><strong className="block text-slate-800">Anamnesis:</strong> {consultation.anamnesis}</div>}
              </div>
            } defaultOpen={true} />
            
            <Accordion title="Examen Físico" content={consultation.physical_exam} />
            
            <Accordion title="Diagnóstico" content={consultation.diagnosis} defaultOpen={true} />
            
            <Accordion title="Plan de Tratamiento" content={consultation.treatment_plan} />
          </div>

        </div>

        {/* Columna Derecha: Tratamientos y Vacunas */}
        <div className="space-y-6">
          
          {/* Tratamientos */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Tratamientos</h3>
              <button 
                onClick={() => setIsTreatmentModalOpen(true)}
                className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                title="Agregar Tratamiento"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              {consultation.treatments?.length > 0 ? (
                <ul className="space-y-3">
                  {consultation.treatments.map(t => (
                    <li key={t.id} className="text-sm pb-3 border-b last:border-0 last:pb-0">
                      <div className="font-medium text-slate-800">{t.treatment_type} {t.product_name && `- ${t.product_name}`}</div>
                      {(t.dose || t.frequency) && <div className="text-slate-500">{t.dose} {t.frequency && `• ${t.frequency}`}</div>}
                      {t.description && <div className="text-slate-600 mt-1">{t.description}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 text-center py-2">No hay tratamientos registrados.</p>
              )}
            </div>
          </div>

          {/* Vacunas */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Vacunas Aplicadas</h3>
              <button 
                onClick={() => setIsVaccineModalOpen(true)}
                className="p-1.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition"
                title="Registrar Vacuna"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              {consultation.vaccination_records?.length > 0 ? (
                <ul className="space-y-3">
                  {consultation.vaccination_records.map(v => (
                    <li key={v.id} className="text-sm pb-3 border-b last:border-0 last:pb-0">
                      <div className="font-medium text-slate-800">{v.vaccine_name}</div>
                      <div className="text-slate-500">Aplicada: {format(new Date(v.administered_date), 'dd/MM/yyyy')}</div>
                      {v.next_dose_date && <div className="text-xs text-amber-600 mt-1">Próxima dosis: {format(new Date(v.next_dose_date), 'dd/MM/yyyy')}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 text-center py-2">No hay vacunas registradas en esta consulta.</p>
              )}
            </div>
          </div>

          {/* Laboratorio */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Resultados de Lab.</h3>
              {/* Se dejó botón simbólico para futura implementación de módulo Storage */}
              <button className="p-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition" title="Agregar Lab (Proximamente)">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              {consultation.lab_results?.length > 0 ? (
                <ul className="space-y-3">
                  {consultation.lab_results.map(l => (
                    <li key={l.id} className="text-sm pb-3 border-b last:border-0 last:pb-0">
                      <div className="font-medium text-slate-800">{l.exam_type}</div>
                      <div className="text-slate-600">{l.result}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 text-center py-2">No hay resultados de laboratorio.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {isTreatmentModalOpen && <TreatmentForm consultationId={id} onClose={() => setIsTreatmentModalOpen(false)} />}
      {isVaccineModalOpen && <VaccineForm consultationId={id} onClose={() => setIsVaccineModalOpen(false)} />}
      
    </div>
  );
}
