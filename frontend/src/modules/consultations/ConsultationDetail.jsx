import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useConsultation, useFollowups, useDeleteFollowup } from './useConsultations';
import TreatmentForm from './TreatmentForm';
import VaccineForm from './VaccineForm';
import LabResultForm from './LabResultForm';
import FollowupForm from './FollowupForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronUp, AlertTriangle, ArrowLeft, Plus, FileText } from 'lucide-react';
import { useCreateInvoice } from '../billing/useBilling';
import useAuthStore from '../../store/authStore';
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

const CollapsibleIndications = ({ indications }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded bg-white mt-2">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-left px-3 py-1.5 bg-slate-50 hover:bg-slate-100 transition text-xs font-semibold text-slate-600 flex justify-between items-center"
      >
        <span>Ver indicaciones</span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-3 text-xs text-slate-600 whitespace-pre-wrap">
          {indications}
        </div>
      )}
    </div>
  );
};

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuthStore();
  const { data: consultation, isLoading, error } = useConsultation(id);
  const { data: followups = [] } = useFollowups(id);
  const deleteFollowupMutation = useDeleteFollowup();
  
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState(null);

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

  const handleDeleteFollowup = async (followupId) => {
    if (window.confirm('¿Está seguro de eliminar este seguimiento?')) {
      try {
        await deleteFollowupMutation.mutateAsync({ consultationId: id, followupId });
      } catch (error) {
        // El error ya es manejado por el hook
      }
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

        {/* Columna Derecha: Tratamientos, Vacunas, Laboratorio y Seguimientos */}
        <div className="space-y-6">
          
          {/* Tratamientos */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Tratamientos</h3>
              {can('clinica', 'crear') && (
                <button 
                  onClick={() => setIsTreatmentModalOpen(true)}
                  className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  title="Agregar Tratamiento"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
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
              {can('clinica', 'crear') && (
                <button 
                  onClick={() => setIsVaccineModalOpen(true)}
                  className="p-1.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition"
                  title="Registrar Vacuna"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
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
              {can('clinica', 'crear') && (
                <button
                  onClick={() => setIsLabModalOpen(true)}
                  className="p-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                  title="Agregar Resultado de Laboratorio"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
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

          {/* Seguimiento */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Seguimiento</h3>
              {can('clinica', 'crear') && (
                <button
                  onClick={() => {
                    setSelectedFollowup(null);
                    setIsFollowupModalOpen(true);
                  }}
                  className="p-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                  title="Agregar Seguimiento"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-4 space-y-4">
              {followups.length > 0 ? (
                <div className="space-y-4">
                  {followups.map(f => {
                    const hasWeightDiff = f.weight_kg !== null && consultation.weight_kg !== null;
                    const weightDiff = hasWeightDiff ? (f.weight_kg - consultation.weight_kg) : 0;
                    const formattedWeightDiff = weightDiff > 0 ? `+${weightDiff.toFixed(2)}` : weightDiff.toFixed(2);

                    const hasTempDiff = f.temperature_c !== null && consultation.temperature_c !== null;
                    const tempDiff = hasTempDiff ? (f.temperature_c - consultation.temperature_c) : 0;
                    const formattedTempDiff = tempDiff > 0 ? `+${tempDiff.toFixed(1)}` : tempDiff.toFixed(1);

                    return (
                      <div 
                        key={f.id} 
                        className={`p-4 rounded-lg border ${f.requires_attention ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} space-y-3 relative`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-semibold text-slate-500 block">
                              {format(new Date(f.followup_date), 'dd/MM/yyyy HH:mm')}
                            </span>
                            {f.requires_attention && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                Atención urgente
                              </span>
                            )}
                          </div>
                          {can('clinica', 'editar') && (
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={() => {
                                  setSelectedFollowup(f);
                                  setIsFollowupModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                                title="Editar"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteFollowup(f.id)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition"
                                title="Eliminar"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-slate-700 whitespace-pre-wrap font-medium">
                          {f.evolution}
                        </div>

                        <div className="flex gap-4 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                          {f.weight_kg !== null && (
                            <div>
                              <span className="font-semibold text-slate-600">Peso:</span> {f.weight_kg} kg 
                              {hasWeightDiff && <span className={`ml-1 font-bold ${weightDiff > 0 ? 'text-emerald-600' : weightDiff < 0 ? 'text-red-600' : 'text-slate-500'}`}>({formattedWeightDiff} kg)</span>}
                            </div>
                          )}
                          {f.temperature_c !== null && (
                            <div>
                              <span className="font-semibold text-slate-600">Temp:</span> {f.temperature_c} °C
                              {hasTempDiff && <span className={`ml-1 font-bold ${tempDiff > 0 ? 'text-red-600' : tempDiff < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>({formattedTempDiff} °C)</span>}
                            </div>
                          )}
                        </div>

                        {f.next_followup_date && (
                          <div className="text-xs text-purple-600 font-semibold">
                            Próximo control: {format(new Date(f.next_followup_date), 'dd/MM/yyyy')}
                          </div>
                        )}

                        {f.indications && (
                          <CollapsibleIndications indications={f.indications} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-2">No hay seguimientos registrados.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {isTreatmentModalOpen && <TreatmentForm consultationId={id} onClose={() => setIsTreatmentModalOpen(false)} />}
      {isVaccineModalOpen && <VaccineForm consultationId={id} onClose={() => setIsVaccineModalOpen(false)} />}
      {isLabModalOpen && <LabResultForm consultationId={id} onClose={() => setIsLabModalOpen(false)} />}
      {isFollowupModalOpen && (
        <FollowupForm 
          consultationId={id} 
          followup={selectedFollowup} 
          onClose={() => {
            setIsFollowupModalOpen(false);
            setSelectedFollowup(null);
          }} 
        />
      )}
      
    </div>
  );
}
