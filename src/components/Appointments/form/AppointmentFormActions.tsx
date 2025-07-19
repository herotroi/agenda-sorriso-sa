
import { Button } from '@/components/ui/button';
import { AppointmentFormData } from '@/types/appointment-form';

interface AppointmentFormActionsProps {
  appointmentToEdit?: any;
  isSaving: boolean;
  formData: AppointmentFormData;
  onClose: () => void;
}

export function AppointmentFormActions({ 
  appointmentToEdit, 
  isSaving, 
  formData, 
  onClose 
}: AppointmentFormActionsProps) {
  // Validação para agendamentos bloqueados vs normais
  const isFormValid = formData.is_blocked 
    ? formData.professional_id && formData.start_time  // Para bloqueios: só precisa de profissional e horário
    : formData.patient_id && formData.professional_id && formData.procedure_id && formData.start_time; // Para agendamentos: precisa de tudo

  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSaving || !isFormValid}>
        {isSaving ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Salvando...</span>
          </div>
        ) : (
          <span>
            {formData.is_blocked 
              ? (appointmentToEdit ? 'Salvar Bloqueio' : 'Bloquear Horário')
              : (appointmentToEdit ? 'Salvar' : 'Criar')
            }
          </span>
        )}
      </Button>
    </div>
  );
}
