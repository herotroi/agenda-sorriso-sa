
import { DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AppointmentFormHeaderProps {
  appointmentToEdit?: any;
  isSaving: boolean;
}

export function AppointmentFormHeader({ appointmentToEdit, isSaving }: AppointmentFormHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center justify-between">
        <span>{appointmentToEdit ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              <span>Salvando...</span>
            </div>
          )}
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Fechar">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>
      </DialogTitle>
    </DialogHeader>
  );
}
