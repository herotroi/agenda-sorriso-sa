
import { useState, useRef, useEffect } from 'react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProfessionalColumn } from './ProfessionalColumn';
import { Professional, Appointment } from '@/types';

interface CalendarGridProps {
  currentDate: Date;
  professionals: Professional[];
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (professionalId: string, startTime: Date) => void;
}

export function CalendarGrid({
  currentDate,
  professionals,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
}: CalendarGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  // Gerar horários de 00:00 às 23:00
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour: hour,
    };
  });

  useEffect(() => {
    const updateHeight = () => {
      const availableHeight = window.innerHeight - 300;
      setContainerHeight(Math.max(600, availableHeight));
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Scroll para o horário atual se for hoje
  useEffect(() => {
    if (isToday(currentDate) && scrollContainerRef.current) {
      const currentHour = new Date().getHours();
      const scrollPosition = (currentHour * 80) - 160; // 80px por hora, centralizar
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [currentDate]);

  return (
    <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
      <div className="flex border-b border-gray-200">
        <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
          <div className="h-12 flex items-center justify-center text-sm font-medium text-gray-500">
            Horário
          </div>
        </div>
        <div className="flex-1 grid grid-flow-col auto-cols-fr">
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className="border-r border-gray-200 last:border-r-0"
            >
              <div className="h-12 px-4 flex items-center justify-center bg-gray-50 border-b border-gray-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {professional.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {professional.specialty}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="overflow-y-auto"
        style={{ height: containerHeight }}
      >
        <div className="flex">
          <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            {timeSlots.map((slot) => (
              <div
                key={slot.time}
                className="h-20 flex items-start justify-center pt-2 border-b border-gray-200 last:border-b-0"
              >
                <span className="text-xs text-gray-500 font-medium">
                  {slot.time}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-flow-col auto-cols-fr">
            {professionals.map((professional) => (
              <ProfessionalColumn
                key={professional.id}
                professional={professional}
                selectedDate={currentDate}
                appointments={appointments.filter(
                  (apt) => apt.professionalId === professional.id
                )}
                timeSlots={timeSlots}
                timeBlocks={[]}
                onAppointmentClick={onAppointmentClick}
                onTimeSlotClick={onTimeSlotClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
