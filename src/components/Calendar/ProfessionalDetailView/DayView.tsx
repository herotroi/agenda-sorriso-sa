
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

  const getLighterColor = (color: string, opacity: number = 0.8) => {
    // Convert hex to RGB and add opacity
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
            const statusColor = appointment.appointment_statuses?.color || '#6b7280';
            const lighterBgColor = getLighterColor(professional.color, 0.7);
            
            return (
              <div
                key={appointment.id}
                onClick={() => onAppointmentClick(appointment)}
                className={`absolute left-1 right-1 rounded-lg p-2 text-xs cursor-pointer hover:opacity-90 transition-all shadow-sm border-l-4`}
                style={{
                  ...position,
                  backgroundColor: lighterBgColor,
                  borderLeftColor: statusColor,
                  borderLeftWidth: '5px',
                  minHeight: '40px',
                  color: '#1f2937'
                }}
              >
                <div className="font-semibold truncate text-gray-800">
                  {appointment.patients?.full_name}
                </div>
                <div className="truncate text-gray-700 mt-1">
                  {appointment.procedures?.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {new Date(appointment.end_time).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div 
                  className="text-xs font-bold mt-1 px-2 py-1 rounded-full text-white inline-block"
                  style={{ backgroundColor: statusColor }}
                >
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
