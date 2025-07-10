
import { Card, CardContent } from '@/components/ui/card';
import { ProfessionalColumn } from './ProfessionalColumn';
import { Appointment } from '@/components/Appointments/types';

interface Professional {
  id: string;
  name: string;
  color: string;
}

interface CalendarGridProps {
  professionals: Professional[];
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function CalendarGrid({ 
  professionals, 
  appointments, 
  selectedDate, 
  onAppointmentClick 
}: CalendarGridProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getAppointmentsForProfessional = (professionalId: string) => {
    return appointments.filter(apt => apt.professional_id === professionalId);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid" style={{ gridTemplateColumns: `60px repeat(${professionals.length}, 1fr)` }}>
          {/* Hours column */}
          <div className="border-r">
            <div className="h-12 border-b flex items-center justify-center text-sm font-medium">
              Hora
            </div>
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b flex items-start justify-center pt-1 text-xs text-gray-500"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Professional columns */}
          {professionals.map((prof) => {
            const profAppointments = getAppointmentsForProfessional(prof.id);
            
            return (
              <ProfessionalColumn
                key={prof.id}
                professional={prof}
                appointments={profAppointments}
                selectedDate={selectedDate}
                hours={hours}
                onAppointmentClick={onAppointmentClick}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
