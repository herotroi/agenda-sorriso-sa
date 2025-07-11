
import { PatientProfessionalSection } from './PatientProfessionalSection';
import { ProcedureSelector } from './ProcedureSelector';
import { DateTimeDurationSection } from './DateTimeDurationSection';
import { StatusSelector } from './StatusSelector';
import { NotesInput } from './NotesInput';
import { Patient, Professional, Procedure, AppointmentStatus } from '@/types/appointment-form';

interface AppointmentFormFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  patients: Patient[];
  professionals: Professional[];
  procedures: Procedure[];
  statuses: AppointmentStatus[];
  onProcedureChange: (procedureId: string) => void;
  handleFieldChange: (field: string, value: any) => void;
  originalData?: any;
  fieldModified: (field: string) => boolean;
}

export function AppointmentFormFields({
  formData,
  setFormData,
  patients,
  professionals,
  procedures,
  statuses,
  onProcedureChange,
  handleFieldChange,
  originalData,
  fieldModified
}: AppointmentFormFieldsProps) {
  const getCurrentPatientName = () => {
    if (!originalData?.patient_id) return undefined;
    const patient = patients.find(p => p.id === originalData.patient_id);
    return patient?.full_name;
  };

  const getCurrentProfessionalName = () => {
    if (!originalData?.professional_id) return undefined;
    const professional = professionals.find(p => p.id === originalData.professional_id);
    return professional?.name;
  };

  const getCurrentProcedureName = () => {
    if (!originalData?.procedure_id) return undefined;
    const procedure = procedures.find(p => p.id === originalData.procedure_id);
    return procedure?.name;
  };

  const getCurrentStatusName = () => {
    if (!originalData?.status_id) return undefined;
    const status = statuses.find(s => s.id === originalData.status_id);
    return status?.label;
  };

  return (
    <div className="space-y-6">
      <PatientProfessionalSection
        patients={patients}
        professionals={professionals}
        formData={formData}
        setFormData={setFormData}
        handleFieldChange={handleFieldChange}
        currentPatientName={getCurrentPatientName()}
        currentProfessionalName={getCurrentProfessionalName()}
        fieldModified={fieldModified}
      />

      <ProcedureSelector
        procedures={procedures}
        value={formData.procedure_id}
        onChange={onProcedureChange}
        currentProcedureName={getCurrentProcedureName()}
        selectedProfessionalId={formData.professional_id}
      />

      <DateTimeDurationSection
        formData={formData}
        setFormData={setFormData}
        handleFieldChange={handleFieldChange}
        fieldModified={fieldModified}
      />

      <StatusSelector
        statuses={statuses}
        value={formData.status_id?.toString() || ''}
        onChange={(value) => {
          const statusId = parseInt(value);
          setFormData(prev => ({ ...prev, status_id: statusId }));
          handleFieldChange('status_id', statusId);
        }}
        currentStatusName={getCurrentStatusName()}
      />

      <NotesInput
        value={formData.notes}
        onChange={(value) => {
          setFormData(prev => ({ ...prev, notes: value }));
          handleFieldChange('notes', value);
        }}
        fieldModified={fieldModified('notes')}
      />
    </div>
  );
}
