
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Appointment } from '@/types';

interface AppointmentRowProps {
  appointment: Appointment;
  onEdit: (appointment: any, event: React.MouseEvent) => void;
}

export function AppointmentRow({ appointment, onEdit }: AppointmentRowProps) {
  const isBlocked = appointment.is_blocked || appointment.isBlocked;
  
  return (
    <TableRow 
      key={appointment.id} 
      className={isBlocked ? 'bg-gray-100 text-gray-500' : ''}
    >
      <TableCell className="font-medium">
        {isBlocked ? 'Horário Bloqueado' : (appointment.patients?.full_name || 'N/A')}
      </TableCell>
      <TableCell>
        {appointment.professionals?.name || 'N/A'}
      </TableCell>
      <TableCell>
        {isBlocked ? 'Bloqueio' : (appointment.procedures?.name || 'Nenhum')}
      </TableCell>
      <TableCell>
        {new Date(appointment.startTime).toLocaleString('pt-BR')}
      </TableCell>
      <TableCell>
        <span 
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: isBlocked ? '#9ca3af20' : (appointment.appointment_statuses?.color + '20'),
            color: isBlocked ? '#6b7280' : (appointment.appointment_statuses?.color || '#6b7280')
          }}
        >
          {isBlocked ? 'Bloqueado' : (appointment.appointment_statuses?.label || 'N/A')}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-gray-600">
          {isBlocked ? 'Horário bloqueado para agendamentos' : 
            (appointment.notes ? (
              appointment.notes.length > 30 
                ? appointment.notes.substring(0, 30) + '...'
                : appointment.notes
            ) : 'Sem observações')
          }
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
