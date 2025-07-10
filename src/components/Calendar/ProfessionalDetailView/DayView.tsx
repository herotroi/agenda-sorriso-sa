
import { Appointment } from '@/components/Appointments/types';

interface Professional {
  id: string;
  name: string;
  color: string;
}

interface DayViewProps {
  professional: Professional;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function DayView({ professional, appointments, onAppointmentClick }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getAppointmentPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return {
      top: `${startHour * 60}px`,
      height: `${duration * 60}px`
    };
  };

  return (
    <div className="relative border rounded-lg">
      {/* Timeline */}
      <div className="grid grid-cols-[80px_1fr]">
        {/* Hours column */}
        <div className="border-r">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-[60px] border-b flex items-start justify-center pt-1 text-xs text-gray-500"
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Appointments column */}
        <div className="relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-[60px] border-b border-gray-100 hover:bg-gray-50"
            />
          ))}
          
          {/* Appointments */}
          {appointments.map((appointment) => {
            const position = getAppointmentPosition(appointment.start_time, appointment.end_time);
            
            return (
              <div
                key={appointment.id}
                onClick={() => onAppointmentClick(appointment)}
                className={`absolute left-1 right-1 rounded p-2 text-xs text-white cursor-pointer hover:opacity-80 transition-opacity border-l-4`}
                style={{
                  ...position,
                  backgroundColor: professional.color,
                  borderLeftColor: appointment.appointment_statuses?.color || '#6b7280',
                  minHeight: '40px'
                }}
              >
                <div className="font-medium truncate">
                  {appointment.patients?.full_name}
                </div>
                <div className="truncate opacity-90">
                  {appointment.procedures?.name}
                </div>
                <div className="text-xs opacity-75">
                  {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {new Date(appointment.end_time).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="text-xs font-semibold">
                  {appointment.appointment_statuses?.label || appointment.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
