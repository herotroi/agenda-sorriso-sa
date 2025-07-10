
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AppointmentForm } from './AppointmentForm';
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
  const [isEditing, setIsEditing] = useState(false);

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

  if (isEditing) {
    return (
      <AppointmentForm
        isOpen={isOpen}
        onClose={() => {
          setIsEditing(false);
          handleClose();
        }}
        appointmentToEdit={appointment}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            onEdit={() => setIsEditing(true)}
            onClose={handleClose}
            onUpdate={onUpdate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
