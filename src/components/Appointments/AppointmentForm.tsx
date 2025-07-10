
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAppointmentFormData } from '@/hooks/useAppointmentFormData';
import { useAppointmentAutoSave } from '@/hooks/useAppointmentAutoSave';
import { useEffect } from 'react';
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

  const { autoSave, manualSave, isSaving } = useAppointmentAutoSave(
    procedures,
    appointmentToEdit,
    () => {
      resetFieldModifications();
    }
  );

  // Auto-save quando há mudanças no formulário (apenas para edição)
  useEffect(() => {
    if (appointmentToEdit && Object.values(fieldModified).some(Boolean)) {
      const timeoutId = setTimeout(() => {
        const finalData = getFinalFormData();
        autoSave(finalData);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, fieldModified, appointmentToEdit, autoSave, getFinalFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = getFinalFormData();
    
    const success = await manualSave(finalData);
    if (success) {
      onClose();
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <AppointmentFormHeader 
          appointmentToEdit={appointmentToEdit}
          isSaving={isSaving}
        />
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
            isSaving={isSaving}
            formData={formData}
            onClose={onClose}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
