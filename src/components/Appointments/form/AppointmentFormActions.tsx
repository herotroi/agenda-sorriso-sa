
import { Button } from '@/components/ui/button';
import { FormData } from '@/types/appointment-form';

interface AppointmentFormActionsProps {
  appointmentToEdit?: any;
  isSaving: boolean;
  formData: FormData;
  onClose: () => void;
}

export function AppointmentFormActions({ 
  appointmentToEdit, 
  isSaving, 
  formData, 
  onClose 
}: AppointmentFormActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSaving || !formData.patient_id || !formData.professional_id}>
        {isSaving ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Salvando...</span>
          </div>
        ) : (
          <span>{appointmentToEdit ? 'Salvar' : 'Criar'}</span>
        )}
      </Button>
    </div>
  );
}
