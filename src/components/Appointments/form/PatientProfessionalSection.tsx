
import { Patient, Professional, Procedure, AppointmentFormData } from '@/types/appointment-form';
import { PatientSelector } from './PatientSelector';
import { ProfessionalSelector } from './ProfessionalSelector';

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
  const handleFieldChange = {
    patient: (value: string) => onFieldChange('patient_id', value),
    professional: (value: string) => onFieldChange('professional_id', value)
  };

  const currentPatientName = originalData && !fieldModified.patient_id 
    ? patients.find(p => p.id === originalData.patient_id)?.full_name 
    : undefined;

  const currentProfessionalName = originalData && !fieldModified.professional_id 
    ? professionals.find(p => p.id === originalData.professional_id)?.name 
    : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PatientSelector
        patients={patients}
        value={formData.patient_id}
        onChange={handleFieldChange.patient}
        currentPatientName={currentPatientName}
      />
      
      <ProfessionalSelector
        professionals={professionals}
        procedures={procedures}
        value={formData.professional_id}
        onChange={handleFieldChange.professional}
        currentProfessionalName={currentProfessionalName}
        selectedProcedureId={formData.procedure_id}
      />
    </div>
  );
}
