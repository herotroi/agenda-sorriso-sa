
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppointmentRow } from './AppointmentRow';
import { AppointmentsEmptyState } from './AppointmentsEmptyState';
import { Appointment } from './types';

interface AppointmentsTableContentProps {
  appointments: Appointment[];
  hasActiveFilters: boolean;
  onCreateAppointment: () => void;
  onEditAppointment: (appointment: any, event: React.MouseEvent) => void;
}

export function AppointmentsTableContent({
  appointments,
  hasActiveFilters,
  onCreateAppointment,
  onEditAppointment
}: AppointmentsTableContentProps) {
  if (appointments.length === 0) {
    return (
      <AppointmentsEmptyState 
        hasActiveFilters={hasActiveFilters}
        onCreateAppointment={onCreateAppointment}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">
          <span className="font-semibold">Legenda:</span> Agendamentos em horário de folga ou férias do profissional são destacados em vermelho claro
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Profissional</TableHead>
            <TableHead>Procedimento</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              onEdit={onEditAppointment}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
