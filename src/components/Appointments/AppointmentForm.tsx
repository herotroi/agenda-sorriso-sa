
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentFormFields } from './form/AppointmentFormFields';
import { useAppointmentFormData } from '@/hooks/useAppointmentFormData';
import { useAppointmentAutoSave } from '@/hooks/useAppointmentAutoSave';
import { useEffect } from 'react';

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
      }, 2000); // Auto-save após 2 segundos de inatividade

      return () => clearTimeout(timeoutId);
    }
  }, [formData, fieldModified, appointmentToEdit, autoSave, getFinalFormData]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = getFinalFormData();
    console.log('Submitting with final data:', finalData);
    
    const success = await manualSave(finalData);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center justify-between">
            <span>
              {appointmentToEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
            </span>
            {isSaving && (
              <span className="text-sm text-muted-foreground animate-pulse">
                Salvando...
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <form onSubmit={onSubmit} className="space-y-4 pb-6">
            <AppointmentFormFields
              formData={formData}
              setFormData={setFormData}
              patients={patients}
              professionals={professionals}
              procedures={procedures}
              statuses={statuses}
              onProcedureChange={handleProcedureChange}
              handleFieldChange={handleFieldChange}
              originalData={originalData}
              fieldModified={fieldModified}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : appointmentToEdit ? 'Salvar' : 'Criar'}
              </Button>
            </div>
            
            {appointmentToEdit && (
              <div className="text-sm text-muted-foreground text-center">
                💡 As alterações são salvas automaticamente
              </div>
            )}
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
