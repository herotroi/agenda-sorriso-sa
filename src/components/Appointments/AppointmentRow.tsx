
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Lock } from 'lucide-react';
import { Appointment } from '@/types';

interface AppointmentRowProps {
  appointment: Appointment;
  onEdit: (appointment: any, event: React.MouseEvent) => void;
}

export function AppointmentRow({ appointment, onEdit }: AppointmentRowProps) {
  const isBlocked = appointment.is_blocked;
  
  return (
    <TableRow 
      key={appointment.id} 
      className={isBlocked ? 'bg-gray-100 border-l-4 border-l-gray-500' : ''}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {isBlocked && <Lock className="h-4 w-4 text-gray-600" />}
          <span className={isBlocked ? 'text-gray-700 font-semibold' : ''}>
            {isBlocked ? 'Horário Bloqueado' : (appointment.patients?.full_name || 'N/A')}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className={isBlocked ? 'text-gray-600' : ''}>
          {appointment.professionals?.name || 'N/A'}
        </span>
      </TableCell>
      <TableCell>
        <span className={isBlocked ? 'text-gray-600 italic' : ''}>
          {isBlocked ? 'Bloqueio de horário' : (appointment.procedures?.name || 'Nenhum')}
        </span>
      </TableCell>
      <TableCell>
        <span className={isBlocked ? 'text-gray-600 font-mono' : ''}>
          {new Date(appointment.start_time).toLocaleString('pt-BR')}
        </span>
      </TableCell>
      <TableCell>
        <span 
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: isBlocked ? '#6b7280' : (appointment.appointment_statuses?.color + '20'),
            color: isBlocked ? '#ffffff' : (appointment.appointment_statuses?.color || '#6b7280')
          }}
        >
          {isBlocked ? 'Horário Bloqueado' : (appointment.appointment_statuses?.label || 'N/A')}
        </span>
      </TableCell>
      <TableCell>
        <span className={`text-sm ${isBlocked ? 'text-gray-600 italic' : 'text-gray-600'}`}>
          {isBlocked ? 'Período indisponível para agendamentos' : 
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
          title={isBlocked ? 'Editar bloqueio' : 'Editar agendamento'}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
