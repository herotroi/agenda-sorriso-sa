
import { TimeBlock } from './TimeBlock';
import { DraggableAppointment } from './DraggableAppointment';
import { DroppableTimeSlot } from './DroppableTimeSlot';
import { Appointment } from '@/components/Appointments/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Professional {
  id: string;
  name: string;
  color: string;
}

interface TimeBlockInterface {
  id: string;
  type: 'break' | 'vacation';
  professional_id: string;
  start_time: string;
  end_time: string;
  title: string;
}

interface CalendarGridProps {
  professionals: Professional[];
  appointments: Appointment[];
  timeBlocks: TimeBlockInterface[];
  selectedDate: Date;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function CalendarGrid({
  professionals,
  appointments,
  timeBlocks,
  selectedDate,
  onAppointmentClick,
}: CalendarGridProps) {
  const isMobile = useIsMobile();

  // Generate time slots from 8:00 to 18:00
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const getAppointmentPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    
    const top = (startHour - 8) * (isMobile ? 48 : 64);
    const height = (endHour - startHour) * (isMobile ? 48 : 64);
    
    return {
      top: `${top}px`,
      height: `${Math.max(height, isMobile ? 24 : 32)}px`
    };
  };

  const getTimeBlockPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    
    const top = (startHour - 8) * (isMobile ? 48 : 64);
    const height = (endHour - startHour) * (isMobile ? 48 : 64);
    
    return {
      top: `${top}px`,
      height: `${Math.max(height, isMobile ? 24 : 32)}px`
    };
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {professionals.map((professional) => {
          const professionalAppointments = appointments.filter(
            (apt) => apt.professional_id === professional.id
          );
          const professionalTimeBlocks = timeBlocks.filter(
            (block) => block.professional_id === professional.id
          );

          return (
            <div key={professional.id} className="bg-white rounded-lg border shadow-sm">
              <div 
                className="p-3 border-b font-medium text-sm"
                style={{ borderLeftColor: professional.color, borderLeftWidth: '4px' }}
              >
                {professional.name}
              </div>
              
              <ScrollArea className="h-64">
                <div className="relative">
                  {timeSlots.map((time, index) => (
                    <DroppableTimeSlot
                      key={`${professional.id}-${time}`}
                      professionalId={professional.id}
                      timeSlot={time}
                      selectedDate={selectedDate}
                    >
                      <div className="h-12 border-b border-gray-100 flex items-center px-2 text-xs text-gray-500">
                        {index === 0 && time}
                      </div>
                    </DroppableTimeSlot>
                  ))}

                  {/* Appointments */}
                  {professionalAppointments.map((appointment) => (
                    <DraggableAppointment
                      key={appointment.id}
                      appointment={appointment}
                      position={getAppointmentPosition(appointment.start_time, appointment.end_time)}
                      onClick={() => onAppointmentClick(appointment)}
                    />
                  ))}

                  {/* Time Blocks */}
                  {professionalTimeBlocks.map((timeBlock) => (
                    <TimeBlock
                      key={timeBlock.id}
                      timeBlock={timeBlock}
                      position={getTimeBlockPosition(timeBlock.start_time, timeBlock.end_time)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <ScrollArea className="h-[600px] lg:h-[700px]">
        <div className="calendar-grid min-w-[800px]" style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${professionals.length}, minmax(200px, 1fr))`
        }}>
          {/* Time column */}
          <div className="border-r border-gray-200">
            <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center text-sm font-medium">
              Hora
            </div>
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-16 border-b border-gray-100 flex items-center justify-center text-sm text-gray-600"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Professional columns */}
          {professionals.map((professional) => {
            const professionalAppointments = appointments.filter(
              (apt) => apt.professional_id === professional.id
            );
            const professionalTimeBlocks = timeBlocks.filter(
              (block) => block.professional_id === professional.id
            );

            return (
              <div key={professional.id} className="border-r border-gray-200 relative">
                <div 
                  className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center text-sm font-medium px-2"
                  style={{ color: professional.color }}
                >
                  {professional.name}
                </div>

                {timeSlots.map((time) => (
                  <DroppableTimeSlot
                    key={`${professional.id}-${time}`}
                    professionalId={professional.id}
                    timeSlot={time}
                    selectedDate={selectedDate}
                  >
                    <div className="h-16 border-b border-gray-100 relative" />
                  </DroppableTimeSlot>
                ))}

                {/* Appointments */}
                {professionalAppointments.map((appointment) => (
                  <DraggableAppointment
                    key={appointment.id}
                    appointment={appointment}
                    position={getAppointmentPosition(appointment.start_time, appointment.end_time)}
                    onClick={() => onAppointmentClick(appointment)}
                  />
                ))}

                {/* Time Blocks */}
                {professionalTimeBlocks.map((timeBlock) => (
                  <TimeBlock
                    key={timeBlock.id}
                    timeBlock={timeBlock}
                    position={getTimeBlockPosition(timeBlock.start_time, timeBlock.end_time)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
