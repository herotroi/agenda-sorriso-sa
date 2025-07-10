
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
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
    <div className="space-y-4">
      {appointmentToEdit && (
        <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
          💡 As alterações são salvas automaticamente
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving || !formData.patient_id || !formData.professional_id}>
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
  );
}
