
import { useState, useRef, useEffect } from 'react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProfessionalColumn } from './ProfessionalColumn';
import { Professional, Appointment } from '@/types';
import { useTimeBlocks } from './hooks/useTimeBlocks';

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
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const { timeBlocks } = useTimeBlocks(professionals, currentDate);

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

  // Sincronizar scroll horizontal entre header e conteúdo
  useEffect(() => {
    const headerScroll = headerScrollRef.current;
    const contentScroll = scrollContainerRef.current;

    if (!headerScroll || !contentScroll) return;

    const syncHeaderToContent = () => {
      if (contentScroll) {
        headerScroll.scrollLeft = contentScroll.scrollLeft;
      }
    };

    const syncContentToHeader = () => {
      if (headerScroll) {
        contentScroll.scrollLeft = headerScroll.scrollLeft;
      }
    };

    contentScroll.addEventListener('scroll', syncHeaderToContent);
    headerScroll.addEventListener('scroll', syncContentToHeader);

    return () => {
      contentScroll.removeEventListener('scroll', syncHeaderToContent);
      headerScroll.removeEventListener('scroll', syncContentToHeader);
    };
  }, []);

  return (
    <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
      <div 
        ref={headerScrollRef}
        className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide"
      >
        <div className="w-12 sm:w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
          <div className="h-10 sm:h-12 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-500">
            <span className="hidden sm:inline">Horário</span>
            <span className="sm:hidden">Hrs</span>
          </div>
        </div>
        <div className="flex min-w-fit">
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className="min-w-[140px] sm:min-w-[180px] border-r border-gray-200 last:border-r-0"
            >
              <div className="h-10 sm:h-12 px-2 sm:px-4 flex items-center justify-center bg-gray-50 border-b border-gray-200">
                <div className="text-center w-full">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {professional.name}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 truncate">
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
        className="overflow-y-auto overflow-x-auto scrollbar-hide"
        style={{ height: containerHeight }}
      >
        <div className="flex relative min-w-fit">
          <div className="w-12 sm:w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            {timeSlots.map((slot) => (
              <div
                key={slot.time}
                className="h-16 sm:h-20 flex items-start justify-center pt-1 sm:pt-2 border-b border-gray-100 last:border-b-0 relative"
              >
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                  {slot.time}
                </span>
              </div>
            ))}
          </div>

          <div className="flex min-w-fit relative flex-1">
            {professionals.map((professional) => (
              <div key={professional.id} className="min-w-[140px] sm:min-w-[180px] relative">
                <ProfessionalColumn
                  professional={professional}
                  selectedDate={currentDate}
                  appointments={appointments.filter(
                    (apt) => apt.professional_id === professional.id
                  )}
                  timeSlots={timeSlots}
                  timeBlocks={timeBlocks.filter(block => 
                    block.professional_id === professional.id
                  )}
                  onAppointmentClick={onAppointmentClick}
                  onTimeSlotClick={onTimeSlotClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
