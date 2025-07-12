
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Stethoscope, Coffee, Plane } from 'lucide-react';
import { Appointment } from '@/components/Appointments/types';

interface Professional {
  id: string;
  name: string;
  color: string;
  break_times?: Array<{ start: string; end: string }>;
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
  working_days?: boolean[];
}

interface TimeBlock {
  id: string;
  type: 'break' | 'vacation';
  professional_id: string;
  start_time: string;
  end_time: string;
  title: string;
}

interface MonthViewProps {
  professional: Professional;
  appointments: Appointment[];
  selectedDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onDayClick: (date: Date, dayAppointments?: Appointment[]) => void;
}

// Função para gerar blocos de tempo com correção de fuso horário
const generateTimeBlocks = (professionals: Professional[], selectedDate: Date): TimeBlock[] => {
  const blocks: TimeBlock[] = [];
  const dateStr = selectedDate.toISOString().split('T')[0];

  professionals.forEach(prof => {
    // Gerar blocos de folga (break times)
    if (prof.break_times && Array.isArray(prof.break_times)) {
      prof.break_times.forEach((breakTime, index) => {
        blocks.push({
          id: `break-${prof.id}-${index}`,
          type: 'break',
          professional_id: prof.id,
          start_time: `${dateStr}T${breakTime.start}:00`,
          end_time: `${dateStr}T${breakTime.end}:00`,
          title: 'Intervalo'
        });
      });
    }

    // Gerar blocos de férias com correção de fuso horário
    if (prof.vacation_active && prof.vacation_start && prof.vacation_end) {
      // Criar datas locais sem conversão de fuso horário
      const vacationStart = new Date(prof.vacation_start + 'T00:00:00');
      const vacationEnd = new Date(prof.vacation_end + 'T23:59:59');
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      if (currentDate >= vacationStart && currentDate <= vacationEnd) {
        blocks.push({
          id: `vacation-${prof.id}`,
          type: 'vacation',
          professional_id: prof.id,
          start_time: `${dateStr}T00:00:00`,
          end_time: `${dateStr}T23:59:59`,
          title: 'Férias'
        });
      }
    }
  });

  return blocks;
};

export function MonthView({ 
  professional, 
  appointments, 
  selectedDate, 
  onNavigateMonth, 
  onDayClick 
}: MonthViewProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getAppointmentsForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate >= dayStart && aptDate <= dayEnd;
    });
  };

  const getTimeBlocksForDay = (date: Date) => {
    return generateTimeBlocks([professional], date);
  };

  const getLighterColor = (color: string, opacity: number = 0.15) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const monthDays = getDaysInMonth(selectedDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => onNavigateMonth('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {selectedDate.toLocaleDateString('pt-BR', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h3>
        <Button variant="outline" size="sm" onClick={() => onNavigateMonth('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Cabeçalhos dos dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm text-gray-600">
            {day}
          </div>
        ))}

        {/* Espaços vazios para o primeiro dia do mês */}
        {Array.from({ length: monthDays[0]?.getDay() || 0 }).map((_, index) => (
          <div key={index} className="p-2"></div>
        ))}

        {/* Dias do mês */}
        {monthDays.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const dayTimeBlocks = getTimeBlocksForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();
          const lighterBgColor = getLighterColor(professional.color, 0.15);

          const hasVacation = dayTimeBlocks.some(block => block.type === 'vacation');
          const hasBreaks = dayTimeBlocks.some(block => block.type === 'break');

          return (
            <div
              key={day.getDate()}
              onClick={() => onDayClick(day, dayAppointments)}
              className={`
                p-2 min-h-[120px] border rounded cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden
                ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
              `}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {day.getDate()}
              </div>
              
              <div className="mt-1 space-y-1">
                {/* Indicadores de férias e pausas */}
                <div className="flex items-center justify-center gap-1 mb-2">
                  {hasVacation && (
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-1 text-xs px-1 py-0.5 text-white font-semibold"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      <Plane className="h-3 w-3" />
                    </Badge>
                  )}
                  {hasBreaks && (
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-1 text-xs px-1 py-0.5 text-white font-semibold"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      <Coffee className="h-3 w-3" />
                    </Badge>
                  )}
                </div>

                {/* Agendamentos */}
                {dayAppointments.length > 0 && (
                  <>
                    {/* Ícone de estetoscópio e contador */}
                    <div className="flex items-center justify-center mb-2">
                      <Badge 
                        variant="secondary" 
                        className="flex items-center gap-1 text-xs px-2 py-1 text-white font-semibold"
                        style={{ backgroundColor: professional.color }}
                      >
                        <Stethoscope className="h-3 w-3" />
                        <span>{dayAppointments.length}</span>
                      </Badge>
                    </div>
                    
                    {/* Mostrar detalhes apenas se for o dia selecionado */}
                    {isSelected && (
                      <>
                        {/* Primeiro agendamento com status mais visível */}
                        {dayAppointments.slice(0, 1).map((apt) => {
                          const statusColor = apt.appointment_statuses?.color || '#6b7280';
                          return (
                            <div
                              key={apt.id}
                              className="text-xs p-2 rounded text-gray-800 border-l-4 shadow-sm overflow-hidden"
                              style={{ 
                                backgroundColor: lighterBgColor,
                                borderLeftColor: statusColor,
                              }}
                            >
                              <div className="space-y-1">
                                <div className="font-semibold truncate">
                                  {apt.patients?.full_name}
                                </div>
                                <div className="flex justify-start">
                                  <div 
                                    className="text-xs font-bold px-1 py-0.5 rounded text-white truncate max-w-full"
                                    style={{ backgroundColor: statusColor }}
                                  >
                                    {apt.appointment_statuses?.label || apt.status}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {dayAppointments.length > 1 && (
                          <div className="text-xs text-gray-500 text-center font-medium">
                            +{dayAppointments.length - 1} mais
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
