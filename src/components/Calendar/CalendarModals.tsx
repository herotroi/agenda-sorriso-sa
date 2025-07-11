
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { Appointment } from '@/components/Appointments/types';

interface CalendarModalsProps {
  isFormOpen: boolean;
  onFormClose: () => void;
  selectedDate: Date;
  selectedAppointment: Appointment | null;
  onDetailsClose: () => void;
  onUpdate: () => void;
}

export function CalendarModals({
  isFormOpen,
  onFormClose,
  selectedDate,
  selectedAppointment,
  onDetailsClose,
  onUpdate,
}: CalendarModalsProps) {
  return (
    <>
      <AppointmentForm
        isOpen={isFormOpen}
        onClose={onFormClose}
        selectedDate={selectedDate}
      />

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={onDetailsClose}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
