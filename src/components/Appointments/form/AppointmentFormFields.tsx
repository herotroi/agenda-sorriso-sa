
import { PatientProfessionalSection } from './PatientProfessionalSection';
import { ProcedureSelector } from './ProcedureSelector';
import { DateTimeDurationSection } from './DateTimeDurationSection';
import { StatusSelector } from './StatusSelector';
import { NotesInput } from './NotesInput';
import { Patient, Professional, Procedure, AppointmentStatus, AppointmentFormData } from '@/types/appointment-form';

interface AppointmentFormFieldsProps {
  formData: AppointmentFormData;
  setFormData: (data: AppointmentFormData) => void;
  patients: Patient[];
  professionals: Professional[];
  procedures: Procedure[];
  statuses: AppointmentStatus[];
  onProcedureChange: (procedureId: string) => void;
  handleFieldChange: (field: string, value: any) => void;
  originalData?: AppointmentFormData;
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
  
  // Helper functions to get current values for display
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

  // Handle procedure change and clear professional selection
  const handleProcedureSelectChange = (procedureId: string) => {
    const updatedFormData = {
      ...formData,
      procedure_id: procedureId,
      professional_id: ''
    };
    setFormData(updatedFormData);
    handleFieldChange('professional_id', '');
    onProcedureChange(procedureId);
  };

  // Handle patient selection
  const handlePatientChange = (patientId: string) => {
    setFormData({ ...formData, patient_id: patientId });
    handleFieldChange('patient_id', patientId);
  };

  // Handle professional selection
  const handleProfessionalChange = (professionalId: string) => {
    setFormData({ ...formData, professional_id: professionalId });
    handleFieldChange('professional_id', professionalId);
  };

  // Handle date/time changes
  const handleStartTimeChange = (startTime: string) => {
    setFormData({ ...formData, start_time: startTime });
    handleFieldChange('start_time', startTime);
  };

  const handleDurationChange = (duration: string) => {
    setFormData({ ...formData, duration });
    handleFieldChange('duration', duration);
  };

  // Handle status change - convert to number for form data
  const handleStatusChange = (statusValue: string) => {
    const statusId = parseInt(statusValue);
    setFormData({ ...formData, status_id: statusId });
    handleFieldChange('status_id', statusValue); // Pass string to handleFieldChange
  };

  // Handle notes change
  const handleNotesChange = (notes: string) => {
    setFormData({ ...formData, notes });
    handleFieldChange('notes', notes);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <ProcedureSelector
              procedures={procedures}
              value={formData.procedure_id}
              onChange={handleProcedureSelectChange}
              currentProcedureName={getCurrentProcedureName()}
            />
          </div>
        </div>
        
        <PatientProfessionalSection
          patients={patients}
          professionals={professionals}
          procedures={procedures}
          formData={formData}
          handleFieldChange={{
            patient: handlePatientChange,
            professional: handleProfessionalChange
          }}
          currentPatientName={getCurrentPatientName()}
          currentProfessionalName={getCurrentProfessionalName()}
        />
      </div>

      <DateTimeDurationSection
        formData={formData}
        handleFieldChange={{
          startTime: handleStartTimeChange,
          duration: handleDurationChange
        }}
        originalData={originalData}
      />

      <StatusSelector
        statuses={statuses}
        value={formData.status_id?.toString() || ''}
        onChange={handleStatusChange}
        currentStatusName={getCurrentStatusName()}
      />

      <NotesInput
        value={formData.notes}
        onChange={handleNotesChange}
      />
    </div>
  );
}
