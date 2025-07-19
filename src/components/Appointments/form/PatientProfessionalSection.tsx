
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
}

export function PatientProfessionalSection({
  formData,
  patients,
  professionals,
  procedures,
  onFieldChange,
  onProcedureChange,
  originalData,
  fieldModified
}: PatientProfessionalSectionProps) {
  // Se for agendamento bloqueado, não mostrar paciente e procedimento
  if (formData.is_blocked) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <ProfessionalSelector
          professionals={professionals}
          procedures={procedures}
          value={formData.professional_id}
          onChange={(value) => onFieldChange('professional_id', value)}
          currentProfessionalName={originalData && !fieldModified.professional_id 
            ? professionals.find(p => p.id === originalData.professional_id)?.name 
            : undefined
          }
          selectedProcedureId={formData.procedure_id}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primeira linha: Paciente e Procedimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PatientSelector
          patients={patients}
          value={formData.patient_id}
          onChange={(value) => onFieldChange('patient_id', value)}
          currentPatientName={originalData && !fieldModified.patient_id 
            ? patients.find(p => p.id === originalData.patient_id)?.full_name 
            : undefined
          }
        />
        
        <ProcedureSelector
          procedures={procedures}
          value={formData.procedure_id}
          onChange={onProcedureChange}
          currentProcedureName={originalData && !fieldModified.procedure_id 
            ? procedures.find(p => p.id === originalData.procedure_id)?.name 
            : undefined
          }
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
            currentProfessionalName={originalData && !fieldModified.professional_id 
              ? professionals.find(p => p.id === originalData.professional_id)?.name 
              : undefined
            }
            selectedProcedureId={formData.procedure_id}
          />
        </div>
      )}
    </div>
  );
}
