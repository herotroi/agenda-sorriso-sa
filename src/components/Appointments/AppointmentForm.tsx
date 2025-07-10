
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AppointmentFormFields } from './form/AppointmentFormFields';
import { useAppointmentFormData } from '@/hooks/useAppointmentFormData';
import { useAppointmentAutoSave } from '@/hooks/useAppointmentAutoSave';
import { useEffect } from 'react';
import { Save, X, Loader2 } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {appointmentToEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Salvando...</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6">
          <form onSubmit={onSubmit} className="py-6">
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
          </form>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {appointmentToEdit && (
                <p className="text-sm text-muted-foreground">
                  💡 As alterações são salvas automaticamente
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              
              <Button 
                onClick={onSubmit}
                disabled={isSaving}
                className="min-w-[100px]"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>{appointmentToEdit ? 'Salvar' : 'Criar'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
