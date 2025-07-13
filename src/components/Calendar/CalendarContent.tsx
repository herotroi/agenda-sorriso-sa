
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { ProfessionalTabs } from './ProfessionalTabs';
import { Appointment } from '@/components/Appointments/types';
import { Professional } from '@/components/Professionals/types';
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
}: CalendarContentProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
      <CalendarHeader
        selectedDate={selectedDate}
        onNavigateDate={onNavigateDate}
        onGoToToday={onGoToToday}
        onNewAppointment={onNewAppointment}
      />
      
      <ProfessionalTabs
        professionals={professionals}
        onProfessionalClick={onProfessionalClick}
        selectedDate={selectedDate}
      />
      
      <div className={`${isMobile ? 'overflow-x-auto' : ''}`}>
        <CalendarGrid
          currentDate={selectedDate}
          professionals={professionals}
          appointments={appointments}
          onAppointmentClick={onAppointmentClick}
          onTimeSlotClick={(professionalId: string, startTime: Date) => {
            // Handle time slot click
          }}
        />
      </div>
    </div>
  );
}
