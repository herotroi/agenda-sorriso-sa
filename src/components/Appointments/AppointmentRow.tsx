
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Appointment } from './types';

interface AppointmentRowProps {
  appointment: Appointment;
  onEdit: (appointment: any, event: React.MouseEvent) => void;
}

export function AppointmentRow({ appointment, onEdit }: AppointmentRowProps) {
  // Check if the appointment is during break time
  const checkIfBreakTime = (appointment: any): boolean => {
    if (!appointment.professionals?.break_times) return false;
    
    const appointmentTime = new Date(appointment.start_time);
    const appointmentHour = appointmentTime.getHours();
    const appointmentMinute = appointmentTime.getMinutes();
    const appointmentTimeInMinutes = appointmentHour * 60 + appointmentMinute;
    
    return appointment.professionals.break_times.some((breakTime: any) => {
      const [startHour, startMinute] = breakTime.start.split(':').map(Number);
      const [endHour, endMinute] = breakTime.end.split(':').map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
      
      return appointmentTimeInMinutes >= startTimeInMinutes && appointmentTimeInMinutes < endTimeInMinutes;
    });
  };

  // Check if the appointment is during vacation time
  const checkIfVacationTime = (appointment: any): boolean => {
    if (!appointment.professionals?.vacation_active || 
        !appointment.professionals?.vacation_start || 
        !appointment.professionals?.vacation_end) {
      return false;
    }
    
    const appointmentDate = new Date(appointment.start_time);
    const vacationStart = new Date(appointment.professionals.vacation_start);
    const vacationEnd = new Date(appointment.professionals.vacation_end);
    
    return appointmentDate >= vacationStart && appointmentDate <= vacationEnd;
  };

  const isBreakTime = checkIfBreakTime(appointment);
  const isVacationTime = checkIfVacationTime(appointment);
  const shouldHighlight = isBreakTime || isVacationTime;
  const highlightReason = isVacationTime ? 'Férias' : isBreakTime ? 'Folga' : '';

  return (
    <TableRow 
      key={appointment.id}
      className={shouldHighlight ? 'bg-red-50 border-red-200' : ''}
    >
      <TableCell className="font-medium">
        {appointment.patients?.full_name || 'N/A'}
      </TableCell>
      <TableCell>
        <div>
          {appointment.professionals?.name || 'N/A'}
          {shouldHighlight && (
            <div className="text-xs text-red-600 font-semibold mt-1">
              {highlightReason}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {appointment.procedures?.name || 'Nenhum'}
      </TableCell>
      <TableCell>
        {new Date(appointment.start_time).toLocaleString('pt-BR')}
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
