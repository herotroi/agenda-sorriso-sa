
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Professional, Appointment } from '@/types';

interface DayViewProps {
  professional: Professional;
  appointments: Appointment[];
  currentDate: Date;
  loading: boolean;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function DayView({
  professional,
  appointments,
  currentDate,
  loading,
  onAppointmentClick
}: DayViewProps) {
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour: hour,
    };
  });

  const getAppointmentsForHour = (hour: number) => {
    return appointments.filter(apt => {
      const startHour = new Date(apt.start_time).getHours();
      return startHour === hour;
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'em-andamento': return 'bg-blue-100 text-blue-800';
      case 'concluido': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-sm text-gray-500">Carregando agendamentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center sticky top-0 bg-background z-10 pb-4 border-b">
        <h3 className="text-lg font-semibold">
          {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <p className="text-sm text-gray-500">
          {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        {timeSlots.map((slot) => {
          const hourAppointments = getAppointmentsForHour(slot.hour);
          
          return (
            <div key={slot.time} className="flex gap-4 min-h-[60px] border-b border-gray-100 last:border-b-0 pb-2">
              <div className="w-16 text-sm text-gray-500 font-medium pt-2 flex-shrink-0">
                {slot.time}
              </div>
              <div className="flex-1 min-w-0">
                {hourAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {hourAppointments.map((appointment) => (
                      <Card 
                        key={appointment.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onAppointmentClick(appointment)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3 flex-wrap min-w-0">
                              <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                                <Clock className="h-3 w-3" />
                                {format(new Date(appointment.start_time), 'HH:mm')} - {format(new Date(appointment.end_time), 'HH:mm')}
                              </div>
                              {appointment.patients && (
                                <div className="flex items-center gap-1 text-sm min-w-0">
                                  <User className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{appointment.patients.full_name}</span>
                                </div>
                              )}
                            </div>
                            <Badge className={`${getStatusColor(appointment.status)} flex-shrink-0`}>
                              {appointment.status === 'confirmado' ? 'Confirmado' :
                               appointment.status === 'cancelado' ? 'Cancelado' :
                               appointment.status === 'em-andamento' ? 'Em andamento' :
                               appointment.status === 'concluido' ? 'Concluído' : 'Confirmado'}
                            </Badge>
                          </div>
                          {appointment.procedures && (
                            <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{appointment.procedures.name}</span>
                            </div>
                          )}
                          {appointment.notes && (
                            <div className="mt-2 text-xs text-gray-500 truncate">
                              {appointment.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="h-12 border-l-2 border-gray-200"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
