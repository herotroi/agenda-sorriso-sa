
import { Patient, Professional, Procedure, AppointmentFormData } from '@/types/appointment-form';
import { PatientSelector } from './PatientSelector';
import { ProfessionalSelector } from './ProfessionalSelector';
import { ProcedureSelector } from './ProcedureSelector';

interface PatientProfessionalSectionProps {
  formData: AppointmentFormData;
  patients: Patient[];
  professionals: Professional[];
  procedures: Procedure[];
  onFieldChange: (field: keyof AppointmentFormData, value: any) => void;
  onProcedureChange: (procedureId: string) => void;
  originalData: AppointmentFormData | null;
  fieldModified: Record<string, boolean>;
  appointmentToEdit?: any;
}

export function PatientProfessionalSection({
  formData,
  patients,
  professionals,
  procedures,
  onFieldChange,
  onProcedureChange,
  originalData,
  fieldModified,
  appointmentToEdit
}: PatientProfessionalSectionProps) {
  // Resolver nomes atuais mesmo antes do carregamento das listas
  const currentPatientName =
    (originalData && !fieldModified.patient_id
      ? patients.find(p => p.id === originalData.patient_id)?.full_name
      : undefined) || appointmentToEdit?.patients?.full_name;

  const currentProcedureName =
    (originalData && !fieldModified.procedure_id
      ? procedures.find(p => p.id === originalData.procedure_id)?.name
      : undefined) || appointmentToEdit?.procedures?.name;

  const currentProfessionalName =
    (originalData && !fieldModified.professional_id
      ? professionals.find(p => p.id === originalData.professional_id)?.name
      : undefined) || appointmentToEdit?.professionals?.name;

  // Se for agendamento bloqueado, mostrar apenas profissional
  if (formData.is_blocked) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <ProfessionalSelector
            professionals={professionals}
            procedures={procedures}
            value={formData.professional_id}
            onChange={(value) => onFieldChange('professional_id', value)}
            currentProfessionalName={currentProfessionalName}
            isBlocked={true}
          />
        </div>
      </div>
    );
  }

  // Para agendamentos normais, mostrar fluxo completo
  return (
    <div className="space-y-6">
      {/* Primeira linha: Paciente e Procedimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PatientSelector
          patients={patients}
          value={formData.patient_id}
          onChange={(value) => onFieldChange('patient_id', value)}
          currentPatientName={currentPatientName}
        />
        
        <ProcedureSelector
          procedures={procedures.filter(p => p.active !== false)}
          value={formData.procedure_id}
          onChange={onProcedureChange}
          currentProcedureName={currentProcedureName}
        />
      </div>

      {/* Segunda linha: Profissional (só aparece após selecionar procedimento) */}
      {formData.procedure_id && (
        <div className="grid grid-cols-1 gap-6">
          <ProfessionalSelector
            professionals={professionals}
            procedures={procedures}
            value={formData.professional_id}
            onChange={(value) => onFieldChange('professional_id', value)}
            currentProfessionalName={currentProfessionalName}
            selectedProcedureId={formData.procedure_id}
            isBlocked={false}
          />
        </div>
      )}
    </div>
  );
}
