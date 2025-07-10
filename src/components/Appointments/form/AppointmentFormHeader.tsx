
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface AppointmentFormHeaderProps {
  appointmentToEdit?: any;
  isSaving: boolean;
}

export function AppointmentFormHeader({ appointmentToEdit, isSaving }: AppointmentFormHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center justify-between">
        <span>{appointmentToEdit ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Salvando...</span>
          </div>
        )}
      </DialogTitle>
    </DialogHeader>
  );
}
