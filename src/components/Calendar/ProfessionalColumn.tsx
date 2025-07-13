
import { DraggableAppointment } from './DraggableAppointment';
import { DroppableTimeSlot } from './DroppableTimeSlot';
import { TimeBlock } from './TimeBlock';
import { Professional, Appointment } from '@/types';

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
    <div className="border-r border-gray-100 last:border-r-0 relative">
      <div className="relative min-h-full">
        {timeSlots.map((slot) => {
          const hasAppointment = appointments.some(apt => {
            const startHour = new Date(apt.startTime).getHours();
            return startHour === slot.hour;
          });

          return (
            <div
              key={slot.hour}
              className="h-20 border-b border-gray-100 hover:bg-gray-50 transition-colors relative"
              onClick={() => {
                if (!hasAppointment) {
                  const startTime = new Date(selectedDate);
                  startTime.setHours(slot.hour, 0, 0, 0);
                  onTimeSlotClick(professional.id, startTime);
                }
              }}
            >
              {/* Linha de meia hora */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-50"></div>
            </div>
          );
        })}
        
        {/* Blocos de tempo (folgas e férias) posicionados absolutamente */}
        <div className="absolute inset-0 pointer-events-none">
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
        
        {/* Agendamentos posicionados absolutamente */}
        <div className="absolute inset-0 pointer-events-none">
          {appointments.map((appointment) => {
            // Convert appointment fields to match DraggableAppointment expectations
            const position = getItemPosition(appointment.startTime, appointment.endTime);
            
            const draggableAppointment = {
              id: appointment.id,
              patient_id: appointment.patientId,
              professional_id: appointment.professionalId,
              start_time: appointment.startTime,
              end_time: appointment.endTime,
              status: appointment.status,
              patients: { full_name: 'Patient Name' }, // This would come from joined data
              procedures: appointment.procedureId ? { name: 'Procedure Name' } : null,
              appointment_statuses: { label: appointment.status, color: '#10b981' }
            };
            
            return (
              <div key={appointment.id} className="pointer-events-auto">
                <DraggableAppointment
                  appointment={draggableAppointment}
                  professionalColor={professional.calendarColor || professional.color}
                  position={position}
                  onClick={() => onAppointmentClick(appointment)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
