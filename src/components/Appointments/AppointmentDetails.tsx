
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { AppointmentInfo } from './AppointmentInfo';
import { AppointmentStatusUpdater } from './AppointmentStatusUpdater';
import { AppointmentActions } from './AppointmentActions';

interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  status: string;
  status_id: number;
  notes?: string;
  patients: { full_name: string };
  procedures: { name: string } | null;
}

interface AppointmentDetailsProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function AppointmentDetails({ appointment, isOpen, onClose, onUpdate }: AppointmentDetailsProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="space-y-4 pb-6">
            <div>
              <h3 className="font-semibold text-lg">{appointment.patients?.full_name}</h3>
              <AppointmentStatusBadge statusId={appointment.status_id} />
            </div>

            <Separator />

            <AppointmentInfo appointment={appointment} />

            <Separator />

            <AppointmentStatusUpdater 
              appointment={appointment} 
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
  );
}
