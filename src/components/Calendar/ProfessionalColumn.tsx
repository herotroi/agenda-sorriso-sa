
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
    
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return {
      top: `${startHour * 60}px`,
      height: `${duration * 60}px`
    };
  };

  return (
    <div className="border-r relative">
      <div className="h-12 border-b flex items-center justify-center font-medium text-sm p-2">
        {professional.name}
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
        
        {/* Appointments */}
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
  );
}
