
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Professional, Appointment } from '@/types';

interface MonthViewProps {
  professional: Professional;
  appointments: Appointment[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function MonthView({
  professional,
  appointments,
  selectedDate,
  onDateChange,
  onAppointmentClick
}: MonthViewProps) {
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.start_time), date)
    );
  };

  const getDayContent = (date: Date) => {
    const dayAppointments = getAppointmentsForDate(date);
    
    if (dayAppointments.length === 0) return null;
    
    return (
      <div className="mt-1">
        <Badge variant="secondary" className="text-xs">
          {dayAppointments.length}
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <p className="text-sm text-gray-500">
          {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} no mês
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            locale={ptBR}
            className="rounded-md border"
            components={{
              DayContent: ({ date }) => (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <span>{date.getDate()}</span>
                  {getDayContent(date)}
                </div>
              ),
            }}
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h4 className="font-medium">
            Agendamentos para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h4>
          
          {getAppointmentsForDate(selectedDate).length > 0 ? (
            getAppointmentsForDate(selectedDate).map((appointment) => (
              <div
                key={appointment.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => onAppointmentClick(appointment)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {format(new Date(appointment.start_time), 'HH:mm')} - {format(new Date(appointment.end_time), 'HH:mm')}
                    </div>
                    {appointment.patients && (
                      <div className="text-sm text-gray-600">
                        {appointment.patients.full_name}
                      </div>
                    )}
                    {appointment.procedures && (
                      <div className="text-sm text-gray-500">
                        {appointment.procedures.name}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {appointment.status === 'confirmado' ? 'Confirmado' :
                     appointment.status === 'cancelado' ? 'Cancelado' :
                     appointment.status === 'em-andamento' ? 'Em andamento' :
                     appointment.status === 'concluido' ? 'Concluído' : 'Confirmado'}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nenhum agendamento para este dia.</p>
          )}
        </div>
      </div>
    </div>
  );
}
