
import { Card, CardContent } from '@/components/ui/card';
import { ProfessionalColumn } from './ProfessionalColumn';
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

interface CalendarGridProps {
  professionals: Professional[];
  appointments: Appointment[];
  timeBlocks: TimeBlock[];
  selectedDate: Date;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function CalendarGrid({ 
  professionals, 
  appointments,
  timeBlocks,
  selectedDate, 
  onAppointmentClick 
}: CalendarGridProps) {
  // Gerar todas as 24 horas do dia (00:00 - 23:00)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getAppointmentsForProfessional = (professionalId: string) => {
    const professionalAppointments = appointments.filter(apt => 
      apt.professional_id === professionalId
    );
    
    console.log(`📊 Professional ${professionalId} appointments:`, professionalAppointments.length);
    
    return professionalAppointments;
  };

  const getTimeBlocksForProfessional = (professionalId: string) => {
    return timeBlocks.filter(block => block.professional_id === professionalId);
  };

  console.log('🏥 CalendarGrid - Total appointments:', appointments.length);
  console.log('👥 CalendarGrid - Professionals:', professionals.length);
  console.log('⏰ CalendarGrid - Time blocks:', timeBlocks.length);

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div 
            className="grid min-w-max" 
            style={{ gridTemplateColumns: `80px repeat(${professionals.length}, minmax(200px, 1fr))` }}
          >
            {/* Coluna de horários */}
            <div className="border-r bg-gray-50">
              <div className="h-12 border-b flex items-center justify-center text-sm font-semibold bg-gray-100 sticky top-0 z-10">
                Horário
              </div>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-50"
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Colunas dos profissionais */}
            {professionals.map((prof) => {
              const profAppointments = getAppointmentsForProfessional(prof.id);
              const profTimeBlocks = getTimeBlocksForProfessional(prof.id);
              
              console.log(`👤 Professional ${prof.name} (${prof.id}) has ${profAppointments.length} appointments and ${profTimeBlocks.length} time blocks`);
              
              return (
                <ProfessionalColumn
                  key={prof.id}
                  professional={prof}
                  appointments={profAppointments}
                  timeBlocks={profTimeBlocks}
                  selectedDate={selectedDate}
                  hours={hours}
                  onAppointmentClick={onAppointmentClick}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
