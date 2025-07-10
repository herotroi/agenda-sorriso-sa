
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentFormFields } from './form/AppointmentFormFields';
import { useAppointmentFormData } from '@/hooks/useAppointmentFormData';
import { useAppointmentFormSubmit } from '@/hooks/useAppointmentFormSubmit';

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
    resetTempData
  } = useAppointmentFormData(isOpen, appointmentToEdit, selectedDate, selectedProfessionalId);

  const { loading, isValidating, handleSubmit } = useAppointmentFormSubmit(
    procedures,
    appointmentToEdit,
    (success) => {
      if (success) {
        resetTempData();
      }
      onClose();
    }
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {appointmentToEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <form onSubmit={(e) => handleSubmit(e, formData)} className="space-y-4 pb-6">
            <AppointmentFormFields
              formData={formData}
              setFormData={setFormData}
              patients={patients}
              professionals={professionals}
              procedures={procedures}
              statuses={statuses}
              onProcedureChange={handleProcedureChange}
              handleFieldChange={handleFieldChange}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || isValidating || !formData.patient_id || !formData.professional_id}
              >
                {loading || isValidating ? 'Validando...' : appointmentToEdit ? 'Atualizar' : 'Agendar'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
