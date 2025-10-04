
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
      
      // Mostrar apenas agendamentos que COMEÇAM nesta hora
      // Isso evita duplicação - cada agendamento aparece apenas uma vez
      return startHour === hour;
    });
  };

  const calculateCardHeight = (appointment: Appointment) => {
    const start = new Date(appointment.start_time);
    const end = new Date(appointment.end_time);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    // Cada minuto = 1px de altura, mínimo 40px
    return Math.max(durationMinutes, 40);
  };

  const getStatusColor = (statusId?: number, type?: string) => {
    // Cores especiais para férias e pausas
    if (type === 'vacation') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (type === 'break') return 'bg-gray-100 text-gray-800 border-gray-300';
    
    // Cores normais para agendamentos baseadas no status_id
    // 1=Confirmado, 2=Cancelado, 3=Não Compareceu, 4=Em atendimento, 5=Finalizado
    switch (statusId) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-red-100 text-red-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 5: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCardStyle = (type?: string) => {
    if (type === 'vacation') return 'border-yellow-300 bg-yellow-50/90';
    if (type === 'break') return 'border-gray-300 bg-gray-50/90';
    return '';
  };

  const getZIndex = (type?: string) => {
    if (type === 'break') return 50;
    if (type === 'vacation') return 40;
    return 30; // agendamentos normais
  };
  const PX_PER_MIN = 1.5; // 1.5px por minuto para cards maiores
  const minutesFromMidnight = (date: Date) => date.getHours() * 60 + date.getMinutes();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-sm text-gray-500">Carregando agendamentos...</div>
      </div>
    );
  }

  // Separar agendamentos normais dos especiais para contagem
  const regularAppointments = appointments.filter(apt => !(apt as any).type);
  const specialItems = appointments.filter(apt => (apt as any).type);

  return (
    <div className="space-y-4">
      <div className="text-center sticky top-0 bg-background z-10 pb-4 border-b">
        <h3 className="text-lg font-semibold">
          {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <p className="text-sm text-gray-500">
          {regularAppointments.length} agendamento{regularAppointments.length !== 1 ? 's' : ''}
          {specialItems.length > 0 && ` • ${specialItems.length} item${specialItems.length !== 1 ? 's' : ''} especial${specialItems.length !== 1 ? 'is' : ''}`}
        </p>
      </div>

      <div className="grid grid-cols-[80px,1fr] gap-2">
        {/* Coluna de horários (esquerda) */}
        <div className="relative" style={{ height: `${24 * 60 * PX_PER_MIN}px` }}>
          {timeSlots.map((slot) => (
            <div 
              key={slot.time} 
              className="absolute text-sm text-gray-500 font-medium -translate-y-2"
              style={{ top: `${slot.hour * 60 * PX_PER_MIN}px` }}
            >
              {slot.time}
            </div>
          ))}
        </div>

        {/* Coluna de agenda contínua (direita) */}
        <div className="relative overflow-hidden rounded-md border bg-white" style={{ height: `${24 * 60 * PX_PER_MIN}px` }}>
          {/* Linhas de grade por hora */}
          {timeSlots.map((slot) => (
            <div
              key={slot.hour}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: `${slot.hour * 60 * PX_PER_MIN}px` }}
            />
          ))}

          {/* Cards posicionados por minuto */}
          {appointments.map((appointment) => {
            const itemType = (appointment as any).type;
            const isSpecialItem = itemType === 'vacation' || itemType === 'break';
            const start = new Date(appointment.start_time);
            const end = new Date(appointment.end_time);
            const top = minutesFromMidnight(start) * PX_PER_MIN;
            const height = Math.max(((end.getTime() - start.getTime()) / 60000) * PX_PER_MIN, 40);

            return (
              <Card
                key={appointment.id}
                className={`absolute left-2 right-2 cursor-pointer overflow-hidden shadow-none ${getCardStyle(itemType)}`}
                style={{ top: `${top}px`, height: `${height}px`, zIndex: getZIndex(itemType) }}
                onClick={() => !isSpecialItem && onAppointmentClick(appointment)}
              >
                <CardContent className="p-2 sm:p-3 h-full">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap min-w-0">
                      <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        {isSpecialItem && itemType === 'vacation'
                          ? 'Dia todo'
                          : `${format(new Date(appointment.start_time), 'HH:mm')} - ${format(new Date(appointment.end_time), 'HH:mm')}`}
                      </div>
                      {appointment.patients && (
                        <div className="flex items-center gap-1 text-sm min-w-0">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className={`truncate ${isSpecialItem ? 'font-semibold' : ''}`}>
                            {appointment.patients.full_name}
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(appointment.status_id, itemType)} flex-shrink-0`}>
                      {appointment.appointment_statuses?.label || 'Status não definido'}
                    </Badge>
                  </div>
                  {appointment.procedures && !isSpecialItem && (
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
