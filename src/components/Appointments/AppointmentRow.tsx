
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Appointment } from '@/types';

interface AppointmentRowProps {
  appointment: Appointment;
  onEdit: (appointment: any, event: React.MouseEvent) => void;
}

export function AppointmentRow({ appointment, onEdit }: AppointmentRowProps) {
  return (
    <TableRow key={appointment.id}>
      <TableCell className="font-medium">
        {appointment.patients?.full_name || 'N/A'}
      </TableCell>
      <TableCell>
        {appointment.professionals?.name || 'N/A'}
      </TableCell>
      <TableCell>
        {appointment.procedures?.name || 'Nenhum'}
      </TableCell>
      <TableCell>
        {new Date(appointment.startTime).toLocaleString('pt-BR')}
      </TableCell>
      <TableCell>
        <span 
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: appointment.appointment_statuses?.color + '20',
            color: appointment.appointment_statuses?.color || '#6b7280'
          }}
        >
          {appointment.appointment_statuses?.label || 'N/A'}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-gray-600">
          {appointment.notes ? (
            appointment.notes.length > 30 
              ? appointment.notes.substring(0, 30) + '...'
              : appointment.notes
          ) : 'Sem observações'}
        </span>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={(event) => onEdit(appointment, event)}
          className="h-8 w-8 p-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
