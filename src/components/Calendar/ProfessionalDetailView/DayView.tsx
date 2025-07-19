
import { Appointment, Professional } from '@/types';

interface TimeBlock {
  id: string;
  type: 'break' | 'vacation';
  professional_id: string;
  start_time: string;
  end_time: string;
  title: string;
}

interface DayViewProps {
  professional: Professional;
  appointments: Appointment[];
  selectedDate: Date;
  loading: boolean;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function DayView({ professional, appointments, selectedDate, loading, onAppointmentClick }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-sm text-gray-500">Carregando...</div>
      </div>
    );
  }

  const getItemPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return {
      top: `${startHour * 60}px`,
      height: `${Math.max(duration * 60, 30)}px`
    };
  };

  const getLighterColor = (color: string, opacity: number = 0.15) => {
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
      <div className="grid grid-cols-[100px_1fr]">
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

        {/* Content column */}
        <div className="relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-[60px] border-b border-gray-100 hover:bg-gray-50"
            />
          ))}
          
          {/* Appointments */}
          {appointments.map((appointment) => {
            const position = getItemPosition(appointment.startTime, appointment.endTime);
            const statusColor = appointment.appointment_statuses?.color || '#6b7280';
            const lighterBgColor = getLighterColor(professional.calendarColor || professional.color, 0.15);
            
            return (
              <div
                key={appointment.id}
                onClick={() => onAppointmentClick(appointment)}
                className={`absolute left-2 right-2 rounded-lg p-3 text-xs cursor-pointer hover:opacity-90 transition-all shadow-sm border-l-8 overflow-hidden z-20`}
                style={{
                  ...position,
                  backgroundColor: lighterBgColor,
                  borderLeftColor: statusColor,
                  color: '#1f2937'
                }}
              >
                <div className="space-y-1">
                  <div className="font-semibold truncate text-gray-800">
                    {appointment.patients?.full_name}
                  </div>
                  <div className="truncate text-gray-700">
                    {appointment.procedures?.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(appointment.startTime).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {new Date(appointment.endTime).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="flex justify-start">
                    <div 
                      className="text-xs font-bold px-2 py-1 rounded-full text-white truncate max-w-full"
                      style={{ backgroundColor: statusColor }}
                    >
                      {appointment.appointment_statuses?.label || appointment.status}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
