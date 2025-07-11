
import { Patient, Professional, Procedure, AppointmentStatus, AppointmentFormData } from '@/types/appointment-form';

interface CurrentValueHelpersProps {
  originalData?: AppointmentFormData | null;
  patients: Patient[];
  professionals: Professional[];
  procedures: Procedure[];
  statuses: AppointmentStatus[];
}

export function useCurrentValueHelpers({
  originalData,
  patients,
  professionals,
  procedures,
  statuses
}: CurrentValueHelpersProps) {
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

  return {
    getCurrentPatientName,
    getCurrentProfessionalName,
    getCurrentProcedureName,
    getCurrentStatusName
  };
}
