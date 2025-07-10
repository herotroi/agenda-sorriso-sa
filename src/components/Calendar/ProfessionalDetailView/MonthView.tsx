
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';
import { Appointment } from '@/components/Appointments/types';

interface Professional {
  id: string;
  name: string;
  color: string;
}

interface MonthViewProps {
  professional: Professional;
  appointments: Appointment[];
  selectedDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onDayClick: (date: Date) => void;
}

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
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={day.getDate()}
              onClick={() => onDayClick(day)}
              className={`
                p-2 min-h-[100px] border rounded cursor-pointer hover:bg-gray-50 transition-colors relative
                ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
              `}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {day.getDate()}
              </div>
              
              {dayAppointments.length > 0 && (
                <div className="mt-1">
                  {/* Ícone de estetoscópio e contador */}
                  <div className="flex items-center justify-center mb-2">
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-1 text-xs px-2 py-1"
                      style={{ backgroundColor: professional.color + '20', color: professional.color }}
                    >
                      <Stethoscope className="h-3 w-3" />
                      <span className="font-semibold">{dayAppointments.length}</span>
                    </Badge>
                  </div>
                  
                  {/* Primeiro agendamento (apenas se houver espaço) */}
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 1).map((apt) => (
                      <div
                        key={apt.id}
                        className="text-xs p-1 rounded text-white truncate"
                        style={{ backgroundColor: professional.color }}
                      >
                        {apt.patients?.full_name}
                      </div>
                    ))}
                    {dayAppointments.length > 1 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 1} mais
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
