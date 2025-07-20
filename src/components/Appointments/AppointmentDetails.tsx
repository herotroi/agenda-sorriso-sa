
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil } from 'lucide-react';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { AppointmentInfo } from './AppointmentInfo';
import { AppointmentStatusUpdater } from './AppointmentStatusUpdater';
import { AppointmentActions } from './AppointmentActions';
import { AppointmentForm } from './AppointmentForm';
import { Appointment } from '@/types';

interface AppointmentDetailsProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function AppointmentDetails({ appointment, isOpen, onClose, onUpdate }: AppointmentDetailsProps) {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const handleClose = () => {
    if (onUpdate) {
      onUpdate();
    }
    onClose();
  };

  const handleStatusUpdate = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };

  const handleEditFormClose = () => {
    setIsEditFormOpen(false);
    // Fechar tanto o formulário quanto a tela de detalhes após editar
    handleClose();
  };

  // Garantir que o appointment tem status definido
  const appointmentWithStatus = {
    ...appointment,
    status: appointment.status || 'confirmado'
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle>Detalhes do Agendamento</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
            <div className="space-y-4 pb-6">
              <div>
                <h3 className="font-semibold text-lg">{appointment.patients?.full_name}</h3>
                <AppointmentStatusBadge statusId={appointment.status_id} />
              </div>

              <Separator />

              <AppointmentInfo appointment={appointmentWithStatus} />

              <Separator />

              <AppointmentStatusUpdater 
                appointment={{
                  ...appointmentWithStatus,
                  status_id: appointment.status_id || 1
                }} 
                onClose={handleClose}
                onUpdate={handleStatusUpdate}
              />

              <Separator />

              <AppointmentActions 
                appointmentId={appointment.id}
                onClose={handleClose}
                onUpdate={onUpdate}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Formulário de Edição */}
      <AppointmentForm
        isOpen={isEditFormOpen}
        onClose={handleEditFormClose}
        selectedDate={new Date(appointment.start_time)}
        appointmentToEdit={appointment}
      />
    </>
  );
}
