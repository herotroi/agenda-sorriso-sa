
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { ProfessionalTabs } from './ProfessionalTabs';
import { Professional, Appointment } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeBlock {
  id: string;
  type: 'break' | 'vacation';
  professional_id: string;
  start_time: string;
  end_time: string;
  title: string;
}

interface CalendarContentProps {
  professionals: Professional[];
  appointments: Appointment[];
  timeBlocks: TimeBlock[];
  selectedDate: Date;
  onNavigateDate: (direction: 'prev' | 'next') => Date;
  onGoToToday: () => Date;
  onNewAppointment: () => void;
  onProfessionalClick: (professionalId: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onDateSelect?: (date: Date) => void;
}

export function CalendarContent({
  professionals,
  appointments,
  timeBlocks,
  selectedDate,
  onNavigateDate,
  onGoToToday,
  onNewAppointment,
  onProfessionalClick,
  onAppointmentClick,
  onDateSelect,
}: CalendarContentProps) {
  const isMobile = useIsMobile();

  // Map professionals to include the color property needed by ProfessionalTabs
  const mappedProfessionals = professionals.map(prof => ({
    ...prof,
    color: prof.calendarColor
  }));

  return (
    <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
      <CalendarHeader
        selectedDate={selectedDate}
        onNavigateDate={onNavigateDate}
        onGoToToday={onGoToToday}
        onNewAppointment={onNewAppointment}
        onDateSelect={onDateSelect}
      />
      
      <ProfessionalTabs
        professionals={mappedProfessionals}
        onProfessionalClick={onProfessionalClick}
        selectedDate={selectedDate}
      />
      
      <div className="w-full">
        <div className={`${isMobile ? 'overflow-x-auto -mx-3 px-3' : ''}`}>
          <CalendarGrid
            currentDate={selectedDate}
            professionals={mappedProfessionals}
            appointments={appointments}
            onAppointmentClick={onAppointmentClick}
            onTimeSlotClick={(professionalId: string, startTime: Date) => {
              // Handle time slot click
            }}
          />
        </div>
      </div>
    </div>
  );
}
