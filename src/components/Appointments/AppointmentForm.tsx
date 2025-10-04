
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAppointmentFormData } from '@/hooks/useAppointmentFormData';
import { useAppointmentFormSubmit } from '@/hooks/useAppointmentFormSubmit';
import { AppointmentFormHeader } from './form/AppointmentFormHeader';
import { AppointmentFormFields } from './form/AppointmentFormFields';
import { AppointmentFormActions } from './form/AppointmentFormActions';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  appointmentToEdit?: any;
  selectedProfessionalId?: string;
}

export function AppointmentForm({ 
  isOpen, 
  onClose, 
  selectedDate = new Date(), 
  appointmentToEdit,
  selectedProfessionalId 
}: AppointmentFormProps) {
  const {
    patients,
    professionals,
    procedures,
    statuses,
    formData,
    setFormData,
    handleProcedureChange,
    handleFieldChange,
    originalData,
    fieldModified,
    getFinalFormData,
    resetFieldModifications
  } = useAppointmentFormData(isOpen, appointmentToEdit, selectedDate, selectedProfessionalId);

  const { loading, isValidating, handleSubmit } = useAppointmentFormSubmit(
    procedures,
    appointmentToEdit,
    (success) => {
      if (success) {
        resetFieldModifications();
        onClose();
      }
    }
  );

  console.log('AppointmentForm render formData:', formData);

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

  const onSubmit = (e: React.FormEvent) => {
    const finalData = getFinalFormData();
    handleSubmit(e, finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <AppointmentFormHeader 
          appointmentToEdit={appointmentToEdit}
          isSaving={loading || isValidating}
        />
        
        <form onSubmit={onSubmit} className="space-y-6">
          <AppointmentFormFields
            formData={formData}
            setFormData={setFormData}
            patients={patients}
            professionals={professionals}
            procedures={procedures}
            statuses={statuses}
            onProcedureChange={handleProcedureSelectChange}
            handleFieldChange={handleFieldChange}
            originalData={originalData}
            fieldModified={fieldModified}
          />

          <AppointmentFormActions
            appointmentToEdit={appointmentToEdit}
            isSaving={loading || isValidating}
            formData={formData}
            onClose={onClose}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
