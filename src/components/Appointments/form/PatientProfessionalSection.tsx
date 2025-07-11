
import { Patient, Professional, AppointmentFormData } from '@/types/appointment-form';
import { PatientSelector } from './PatientSelector';
import { ProfessionalSelector } from './ProfessionalSelector';

interface PatientProfessionalSectionProps {
  formData: AppointmentFormData;
  patients: Patient[];
  professionals: Professional[];
  handleFieldChange: (field: keyof AppointmentFormData, value: string | number) => void;
  currentPatientName?: string;
  currentProfessionalName?: string;
}

export function PatientProfessionalSection({
  formData,
  patients,
  professionals,
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
        value={formData.professional_id}
        onChange={(value) => handleFieldChange('professional_id', value)}
        currentProfessionalName={currentProfessionalName}
      />
    </div>
  );
}
