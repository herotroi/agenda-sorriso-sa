
import { Patient, Professional, Procedure, AppointmentStatus, FormData } from '@/types/appointment-form';
import { ProcedureSelector } from './ProcedureSelector';
import { StatusSelector } from './StatusSelector';
import { NotesInput } from './NotesInput';
import { PatientProfessionalSection } from './PatientProfessionalSection';
import { DateTimeDurationSection } from './DateTimeDurationSection';
import { useCurrentValueHelpers } from './CurrentValueHelpers';

interface AppointmentFormFieldsProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  patients: Patient[];
  professionals: Professional[];
  procedures: Procedure[];
  statuses: AppointmentStatus[];
  onProcedureChange: (procedureId: string) => void;
  handleFieldChange: (field: keyof FormData, value: string | number) => void;
  originalData?: FormData | null;
  fieldModified?: Record<keyof FormData, boolean>;
}

export function AppointmentFormFields({
  formData,
  patients,
  professionals,
  procedures,
  statuses,
  onProcedureChange,
  handleFieldChange,
  originalData
}: AppointmentFormFieldsProps) {
  
  const {
    getCurrentPatientName,
    getCurrentProfessionalName,
    getCurrentProcedureName,
    getCurrentStatusName
  } = useCurrentValueHelpers({
    originalData,
    patients,
    professionals,
    procedures,
    statuses
  });

  return (
    <div className="space-y-6">
      <PatientProfessionalSection
        formData={formData}
        patients={patients}
        professionals={professionals}
        handleFieldChange={handleFieldChange}
        currentPatientName={getCurrentPatientName()}
        currentProfessionalName={getCurrentProfessionalName()}
      />

      <ProcedureSelector
        procedures={procedures}
        value={formData.procedure_id}
        onChange={onProcedureChange}
        currentProcedureName={getCurrentProcedureName()}
      />

      <DateTimeDurationSection
        formData={formData}
        handleFieldChange={handleFieldChange}
        originalData={originalData}
      />

      <StatusSelector
        statuses={statuses}
        value={formData.status_id.toString()}
        onChange={(value) => handleFieldChange('status_id', value)}
        currentStatusName={getCurrentStatusName()}
      />

      <NotesInput
        value={formData.notes}
        onChange={(value) => handleFieldChange('notes', value)}
        currentValue={originalData?.notes}
      />
    </div>
  );
}
