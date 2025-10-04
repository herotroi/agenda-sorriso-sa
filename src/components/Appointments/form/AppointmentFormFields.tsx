import { useEffect } from 'react';
import { AppointmentFormData, Patient, Professional, Procedure } from '@/types/appointment-form';
import { PatientProfessionalSection } from './PatientProfessionalSection';
import { DateTimeDurationSection } from './DateTimeDurationSection';
import { StatusSelector } from './StatusSelector';
import { NotesInput } from './NotesInput';
import { BlockedAppointmentToggle } from './BlockedAppointmentToggle';
import { PaymentSection } from './PaymentSection';

interface AppointmentStatus {
  id: number;
  label: string;
  color?: string;
}

interface AppointmentFormFieldsProps {
  formData: AppointmentFormData;
  setFormData: (data: AppointmentFormData) => void;
  patients: Patient[];
  professionals: Professional[];
  procedures: Procedure[];
  statuses: AppointmentStatus[];
  onProcedureChange: (procedureId: string) => void;
  handleFieldChange: (field: string, value: any) => void;
  originalData: AppointmentFormData | null;
  fieldModified: Record<string, boolean>;
  appointmentToEdit?: any;
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
  fieldModified,
  appointmentToEdit
}: AppointmentFormFieldsProps) {
  const handleFieldUpdate = (field: keyof AppointmentFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
    handleFieldChange(field, value);
  };

  // Prefill safety: ensure fields are populated when editing
  useEffect(() => {
    if (!appointmentToEdit) return;
    const patch: Partial<AppointmentFormData> = {};
    if (!formData.patient_id && appointmentToEdit.patient_id) patch.patient_id = String(appointmentToEdit.patient_id);
    if (!formData.procedure_id && appointmentToEdit.procedure_id) patch.procedure_id = String(appointmentToEdit.procedure_id);
    if (!formData.professional_id && appointmentToEdit.professional_id) patch.professional_id = String(appointmentToEdit.professional_id);
    if (!formData.payment_method && appointmentToEdit.payment_method) patch.payment_method = String(appointmentToEdit.payment_method);
    if (!formData.payment_status && appointmentToEdit.payment_status) patch.payment_status = String(appointmentToEdit.payment_status);
    if (!formData.notes && appointmentToEdit.notes) patch.notes = String(appointmentToEdit.notes);
    if (!formData.is_blocked && appointmentToEdit.is_blocked) patch.is_blocked = !!appointmentToEdit.is_blocked;
    if ((!formData.status_id || formData.status_id === 0) && appointmentToEdit.status_id) patch.status_id = Number(appointmentToEdit.status_id);
    if (Object.keys(patch).length) {
      setFormData({ ...formData, ...patch } as AppointmentFormData);
    }
  }, [appointmentToEdit, formData, setFormData]);

  return (
    <div className="space-y-6">
      <BlockedAppointmentToggle 
        isBlocked={formData.is_blocked || false}
        onChange={(checked) => handleFieldUpdate('is_blocked', checked)}
      />

      <PatientProfessionalSection
        formData={formData}
        patients={patients}
        professionals={professionals}
        procedures={procedures}
        onFieldChange={handleFieldUpdate}
        onProcedureChange={onProcedureChange}
        originalData={originalData}
        fieldModified={fieldModified}
        appointmentToEdit={appointmentToEdit}
      />
      
      <DateTimeDurationSection
        formData={formData}
        onFieldChange={handleFieldUpdate}
        originalData={originalData}
        fieldModified={fieldModified}
      />

      {!formData.is_blocked && (
        <>
          <StatusSelector
            statuses={statuses}
            value={formData.status_id ? String(formData.status_id) : ''}
            onChange={(value) => handleFieldUpdate('status_id', parseInt(value))}
            currentStatusName={originalData && !fieldModified.status_id 
              ? statuses.find(s => s.id === originalData.status_id)?.label 
              : undefined
            }
          />

          <PaymentSection
            paymentMethod={formData.payment_method || ''}
            paymentStatus={formData.payment_status || ''}
            onPaymentMethodChange={(value) => handleFieldUpdate('payment_method', value)}
            onPaymentStatusChange={(value) => handleFieldUpdate('payment_status', value)}
            currentPaymentMethod={originalData && !fieldModified.payment_method ? originalData.payment_method : undefined}
            currentPaymentStatus={originalData && !fieldModified.payment_status ? originalData.payment_status : undefined}
          />
        </>
      )}

      <NotesInput
        value={formData.notes}
        onChange={(value) => handleFieldUpdate('notes', value)}
        currentValue={originalData && !fieldModified.notes ? originalData.notes : undefined}
      />
    </div>
  );
}
