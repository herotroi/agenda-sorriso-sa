
import { DraggableAppointment } from './DraggableAppointment';
import { DroppableTimeSlot } from './DroppableTimeSlot';
import { Appointment } from '@/components/Appointments/types';

interface Professional {
  id: string;
  name: string;
  color: string;
}

interface ProfessionalColumnProps {
  professional: Professional;
  appointments: Appointment[];
  selectedDate: Date;
  hours: number[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function ProfessionalColumn({ 
  professional, 
  appointments, 
  selectedDate, 
  hours, 
  onAppointmentClick 
}: ProfessionalColumnProps) {
  const getAppointmentPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    // Calcular posição precisa baseada no horário
    const topPosition = startHour * 64 + (startMinutes / 60) * 64; // 64px = altura de cada slot de hora
    const height = Math.max(duration * 64, 32); // altura mínima de 32px
    
    return {
      top: `${topPosition}px`,
      height: `${height}px`
    };
  };

  return (
    <div className="border-r relative bg-white">
      <div className="h-12 border-b flex items-center justify-center font-semibold text-sm p-2 bg-gray-100 sticky top-0 z-10">
        <div className="text-center">
          <div className="truncate max-w-full" title={professional.name}>
            {professional.name}
          </div>
        </div>
      </div>
      
      <div className="relative">
        {hours.map((hour) => {
          const hasAppointment = appointments.some(apt => {
            const startHour = new Date(apt.start_time).getHours();
            return startHour === hour;
          });

          return (
            <DroppableTimeSlot
              key={hour}
              hour={hour}
              professionalId={professional.id}
              date={selectedDate}
              hasAppointment={hasAppointment}
            />
          );
        })}
        
        {/* Agendamentos posicionados absolutamente */}
        <div className="absolute inset-0">
          {appointments.map((appointment) => {
            const position = getAppointmentPosition(appointment.start_time, appointment.end_time);
            
            return (
              <DraggableAppointment
                key={appointment.id}
                appointment={appointment}
                professionalColor={professional.color}
                position={position}
                onClick={() => onAppointmentClick(appointment)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
