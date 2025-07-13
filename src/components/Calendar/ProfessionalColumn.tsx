
import { DraggableAppointment } from './DraggableAppointment';
import { DroppableTimeSlot } from './DroppableTimeSlot';
import { TimeBlock } from './TimeBlock';
import { Appointment } from '@/types';
import { Professional } from '@/types';

interface TimeBlockType {
  id: string;
  type: 'break' | 'vacation';
  professional_id: string;
  start_time: string;
  end_time: string;
  title: string;
}

interface ProfessionalColumnProps {
  professional: Professional;
  appointments: Appointment[];
  timeBlocks: TimeBlockType[];
  selectedDate: Date;
  timeSlots: { time: string; hour: number; }[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (professionalId: string, startTime: Date) => void;
}

export function ProfessionalColumn({ 
  professional, 
  appointments, 
  timeBlocks = [],
  selectedDate, 
  timeSlots, 
  onAppointmentClick,
  onTimeSlotClick
}: ProfessionalColumnProps) {
  const getItemPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    // Calcular posição precisa baseada no horário
    const topPosition = startHour * 80 + (startMinutes / 60) * 80; // 80px por hora
    const height = Math.max(duration * 80, 32); // altura mínima de 32px
    
    return {
      top: `${topPosition}px`,
      height: `${height}px`
    };
  };

  // Filtrar blocos de tempo para este profissional
  const professionalTimeBlocks = timeBlocks ? timeBlocks.filter(block => 
    block.professional_id === professional.id
  ) : [];

  return (
    <div className="border-r border-gray-200 last:border-r-0">
      <div className="relative">
        {timeSlots.map((slot) => {
          const hasAppointment = appointments.some(apt => {
            const startHour = new Date(apt.startTime).getHours();
            return startHour === slot.hour;
          });

          return (
            <DroppableTimeSlot
              key={slot.hour}
              hour={slot.hour}
              professionalId={professional.id}
              date={selectedDate}
              hasAppointment={hasAppointment}
            />
          );
        })}
        
        {/* Blocos de tempo (folgas e férias) posicionados absolutamente */}
        <div className="absolute inset-0">
          {professionalTimeBlocks.map((timeBlock) => {
            const position = getItemPosition(timeBlock.start_time, timeBlock.end_time);
            
            return (
              <TimeBlock
                key={timeBlock.id}
                timeBlock={timeBlock}
                position={position}
              />
            );
          })}
        </div>
        
        {/* Agendamentos posicionados absolutemente */}
        <div className="absolute inset-0">
          {appointments.map((appointment) => {
            const position = getItemPosition(appointment.startTime, appointment.endTime);
            
            return (
              <DraggableAppointment
                key={appointment.id}
                appointment={appointment}
                professionalColor={professional.calendarColor || '#3b82f6'}
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
