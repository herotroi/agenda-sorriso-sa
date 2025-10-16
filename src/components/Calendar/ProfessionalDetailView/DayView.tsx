
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User, FileText } from 'lucide-react';
import { useMemo } from 'react';
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

  // Calcular "lanes" e o número máximo de colunas simultâneas para cada agendamento
  const layoutAppointments = useMemo(() => {
    const items = appointments
      .filter((a) => (a as any).type !== 'vacation') // inclui normais e pausas
      .slice()
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    type Meta = { lane: number; cols: number; start: number; end: number; item: Appointment };
    const metas: Meta[] = [];
    const active: Meta[] = [];

    for (const apt of items) {
      const start = new Date(apt.start_time).getTime();
      const end = new Date(apt.end_time).getTime();

      // Remove itens que já terminaram
      for (let i = 0; i < active.length; i++) {
        if (active[i].end <= start) {
          active.splice(i, 1);
          i--;
        }
      }

      // Descobrir o menor lane disponível
      const used = new Set(active.map((m) => m.lane));
      let lane = 0;
      while (used.has(lane)) lane++;

      const meta: Meta = { lane, cols: Math.max(1, active.length + 1), start, end, item: apt };
      active.push(meta);
      metas.push(meta);

      // Atualiza cols de todos os ativos (máximo simultâneo até o momento)
      for (const m of active) {
        m.cols = Math.max(m.cols, active.length);
      }
    }

    return metas;
  }, [appointments]);

  return (
    <div className="space-y-4">
      <div className="text-center sticky top-0 bg-background z-30 pb-4 border-b shadow-none">
        <h3 className="text-lg font-semibold">
          {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <p className="text-sm text-gray-500">
          {regularAppointments.length} agendamento{regularAppointments.length !== 1 ? 's' : ''}
          {specialItems.length > 0 && ` • ${specialItems.length} item${specialItems.length !== 1 ? 's' : ''} especial${specialItems.length !== 1 ? 'is' : ''}`}
        </p>
      </div>

      <div className="relative mt-2 overflow-hidden rounded-md border bg-white" style={{ height: `${24 * 60 * PX_PER_MIN}px` }}>
        {/* Horários à esquerda (posicionados absolutamente) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 border-r bg-gray-50/50 z-0">
          {timeSlots.map((slot) => (
            <div 
              key={slot.time} 
              className="absolute text-[10px] sm:text-xs md:text-sm text-gray-500 font-medium px-1 sm:px-2"
              style={{ top: `${slot.hour * 60 * PX_PER_MIN}px` }}
            >
              {slot.time}
            </div>
          ))}
        </div>

        {/* Linhas de grade por hora */}
        {timeSlots.map((slot) => (
          <div
            key={slot.hour}
            className="absolute left-12 sm:left-16 md:left-20 right-0 border-t border-gray-100"
            style={{ top: `${slot.hour * 60 * PX_PER_MIN}px` }}
          />
        ))}

        {/* Área de conteúdo (cards) alinhada com a coluna de horários */}
        <div className="absolute left-12 sm:left-16 md:left-20 right-0 top-0 bottom-0 relative">
          {/* Férias como faixa de fundo (não clicável) */}
          {appointments.filter(a => (a as any).type === 'vacation').map((appointment) => {
            const start = new Date(appointment.start_time);
            const end = new Date(appointment.end_time);
            const top = minutesFromMidnight(start) * PX_PER_MIN;
            const height = Math.max(((end.getTime() - start.getTime()) / 60000) * PX_PER_MIN, 40);
            return (
              <Card
                key={`vac-${appointment.id}`}
                className={`absolute pointer-events-none ${getCardStyle('vacation')}`}
                style={{ top: `${top}px`, height: `${height}px`, left: '8px', right: '8px', zIndex: 5 }}
              >
                <CardContent className="p-1 h-full" />
              </Card>
            );
          })}
          {layoutAppointments.map(({ item, lane, cols }) => {
            const appointment = item;
            const itemType = (appointment as any).type;
            const isSpecialItem = itemType === 'vacation' || itemType === 'break';
            const start = new Date(appointment.start_time);
            const end = new Date(appointment.end_time);
            const top = minutesFromMidnight(start) * PX_PER_MIN;
            const height = Math.max(((end.getTime() - start.getTime()) / 60000) * PX_PER_MIN, 40);
            const lanes = isSpecialItem ? 1 : Math.max(1, cols);
            const laneIndex = isSpecialItem ? 0 : lane;
            const widthPct = 100 / lanes;
            const leftPct = widthPct * laneIndex;
            const GUTTER = 8; // espaçamento entre colunas

            return (
              <Card
                key={appointment.id}
                className={`absolute cursor-pointer overflow-hidden shadow-none ${getCardStyle(itemType)}`}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: `calc(${leftPct}% + ${GUTTER / 2}px)`,
                  width: `calc(${widthPct}% - ${GUTTER}px)`,
                  zIndex: 1 + laneIndex
                }}
                onClick={() => !isSpecialItem && onAppointmentClick(appointment)}
              >
                <CardContent className="p-1.5 sm:p-2 md:p-3 h-full overflow-hidden">
                  <div className="flex items-center justify-between flex-wrap gap-1 sm:gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs md:text-sm text-gray-600 flex-shrink-0">
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {isSpecialItem && itemType === 'vacation'
                          ? 'Dia todo'
                          : `${format(new Date(appointment.start_time), 'HH:mm')} - ${format(new Date(appointment.end_time), 'HH:mm')}`}
                      </div>
                      {appointment.patients && (
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs md:text-sm min-w-0">
                          <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span className={`truncate ${isSpecialItem ? 'font-semibold' : ''}`}>
                            {appointment.patients.full_name}
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(appointment.status_id, itemType)} flex-shrink-0 text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5`}>
                      {appointment.appointment_statuses?.label || 'Status não definido'}
                    </Badge>
                  </div>
                  {appointment.procedures && !isSpecialItem && (
                    <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs md:text-sm text-gray-600 flex items-center gap-1">
                      <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                      <span className="truncate">{appointment.procedures.name}</span>
                    </div>
                  )}
                  {appointment.notes && (
                    <div className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] md:text-xs text-gray-500 line-clamp-2">
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
