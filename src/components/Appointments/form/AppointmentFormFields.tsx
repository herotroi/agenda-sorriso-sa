import { PatientProfessionalSection } from './PatientProfessionalSection';
import { ProcedureSelector } from './ProcedureSelector';
import { DateTimeDurationSection } from './DateTimeDurationSection';
import { StatusSelector } from './StatusSelector';
import { NotesInput } from './NotesInput';
import { BlockedAppointmentToggle } from './BlockedAppointmentToggle';
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

  const handleProcedureSelectChange = (procedureId: string) => {
    const procedure = procedures.find(p => p.id === procedureId);
    const duration = procedure ? procedure.default_duration.toString() : formData.duration;
    
    setFormData(prev => ({
      ...prev,
      procedure_id: procedureId,
      duration: duration
    }));
    
    handleFieldChange('procedure_id', procedureId);
    handleFieldChange('duration', duration);
  };

  const handlePatientChange = (patientId: string) => {
    setFormData({ ...formData, patient_id: patientId });
    handleFieldChange('patient_id', patientId);
  };

  const handleProfessionalChange = (professionalId: string) => {
    setFormData({ ...formData, professional_id: professionalId });
    handleFieldChange('professional_id', professionalId);
  };

  const handleStartTimeChange = (startTime: string) => {
    setFormData({ ...formData, start_time: startTime });
    handleFieldChange('start_time', startTime);
  };

  const handleDurationChange = (duration: string) => {
    setFormData({ ...formData, duration });
    handleFieldChange('duration', duration);
  };

  const handleStatusChange = (statusValue: string) => {
    const statusId = parseInt(statusValue);
    setFormData({ ...formData, status_id: statusId });
    handleFieldChange('status_id', statusValue);
  };

  const handleNotesChange = (notes: string) => {
    setFormData({ ...formData, notes });
    handleFieldChange('notes', notes);
  };

  const handleBlockedChange = (isBlocked: boolean) => {
    setFormData({ ...formData, is_blocked: isBlocked });
    handleFieldChange('is_blocked', isBlocked);
  };

  return (
    <div className="space-y-6">
      <BlockedAppointmentToggle
        isBlocked={formData.is_blocked || false}
        onChange={handleBlockedChange}
      />

      {!formData.is_blocked && (
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
      )}

      {formData.is_blocked && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profissional *
            </label>
            <select
              value={formData.professional_id}
              onChange={(e) => handleProfessionalChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um profissional</option>
              {professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.name} {professional.specialty && `- ${professional.specialty}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <DateTimeDurationSection
        formData={formData}
        handleFieldChange={{
          startTime: handleStartTimeChange,
          duration: handleDurationChange
        }}
        originalData={originalData}
      />

      {!formData.is_blocked && (
        <>
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
        </>
      )}
    </div>
  );
}
