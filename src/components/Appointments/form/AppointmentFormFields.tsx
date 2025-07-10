
import { Patient, Professional, Procedure, AppointmentStatus, FormData } from '@/types/appointment-form';
import { PatientSelector } from './PatientSelector';
import { ProfessionalSelector } from './ProfessionalSelector';
import { ProcedureSelector } from './ProcedureSelector';
import { DateTimeInput } from './DateTimeInput';
import { DurationInput } from './DurationInput';
import { StatusSelector } from './StatusSelector';
import { NotesInput } from './NotesInput';

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
  
  const getCurrentPatientName = () => {
    if (!originalData) return '';
    const patient = patients.find(p => p.id === originalData.patient_id);
    return patient ? patient.full_name : '';
  };

  const getCurrentProfessionalName = () => {
    if (!originalData) return '';
    const professional = professionals.find(p => p.id === originalData.professional_id);
    return professional ? professional.name : '';
  };

  const getCurrentProcedureName = () => {
    if (!originalData) return '';
    const procedure = procedures.find(p => p.id === originalData.procedure_id);
    return procedure ? `${procedure.name} - R$ ${procedure.price.toFixed(2)}` : '';
  };

  const getCurrentStatusName = () => {
    if (!originalData) return '';
    const status = statuses.find(s => s.id === originalData.status_id);
    return status ? status.label : '';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PatientSelector
          patients={patients}
          value={formData.patient_id}
          onChange={(value) => handleFieldChange('patient_id', value)}
          currentPatientName={getCurrentPatientName()}
        />
        
        <ProfessionalSelector
          professionals={professionals}
          value={formData.professional_id}
          onChange={(value) => handleFieldChange('professional_id', value)}
          currentProfessionalName={getCurrentProfessionalName()}
        />
      </div>

      <ProcedureSelector
        procedures={procedures}
        value={formData.procedure_id}
        onChange={onProcedureChange}
        currentProcedureName={getCurrentProcedureName()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateTimeInput
          value={formData.start_time}
          onChange={(value) => handleFieldChange('start_time', value)}
          currentValue={originalData?.start_time}
        />
        
        <DurationInput
          value={formData.duration}
          onChange={(value) => handleFieldChange('duration', value)}
          currentValue={originalData?.duration}
        />
      </div>

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
