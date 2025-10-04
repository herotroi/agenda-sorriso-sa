
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
            value={formData.status_id.toString()}
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
