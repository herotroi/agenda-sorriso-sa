
import { Patient, Professional, Procedure, AppointmentFormData } from '@/types/appointment-form';
import { PatientSelector } from './PatientSelector';
import { ProfessionalSelector } from './ProfessionalSelector';

interface PatientProfessionalSectionProps {
  formData: AppointmentFormData;
  patients: Patient[];
  professionals: Professional[];
  procedures: Procedure[];
  handleFieldChange: (field: keyof AppointmentFormData, value: string | number) => void;
  currentPatientName?: string;
  currentProfessionalName?: string;
}

export function PatientProfessionalSection({
  formData,
  patients,
  professionals,
  procedures,
  handleFieldChange,
  currentPatientName,
  currentProfessionalName
}: PatientProfessionalSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PatientSelector
        patients={patients}
        value={formData.patient_id}
        onChange={(value) => handleFieldChange('patient_id', value)}
        currentPatientName={currentPatientName}
      />
      
      <ProfessionalSelector
        professionals={professionals}
        procedures={procedures}
        value={formData.professional_id}
        onChange={(value) => handleFieldChange('professional_id', value)}
        currentProfessionalName={currentProfessionalName}
        selectedProcedureId={formData.procedure_id}
      />
    </div>
  );
}
