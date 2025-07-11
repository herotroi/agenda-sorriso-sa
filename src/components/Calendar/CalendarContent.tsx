
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { ProfessionalTabs } from './ProfessionalTabs';
import { Appointment } from '@/components/Appointments/types';

interface Professional {
  id: string;
  name: string;
  color: string;
}

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
  return (
    <div className="space-y-6">
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
      
      <CalendarGrid
        professionals={professionals}
        appointments={appointments}
        timeBlocks={timeBlocks}
        selectedDate={selectedDate}
        onAppointmentClick={onAppointmentClick}
      />
    </div>
  );
}
