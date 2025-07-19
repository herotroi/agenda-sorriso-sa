
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment, Professional } from '@/types';

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
  const appointmentsByDay = appointments.reduce((acc: { [key: string]: Appointment[] }, appointment) => {
    const day = new Date(appointment.startTime).toISOString().split('T')[0];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(appointment);
    return acc;
  }, {});

  const onNavigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'next') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const onDayClick = (date: Date, appointments?: Appointment[]) => {
    onDateChange(date);
    if (appointments && appointments.length > 0) {
      onAppointmentClick(appointments[0]);
    }
  };

  // Get the first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  const days = [];
  const currentDate = new Date(startDate);
  
  // Generate 42 days (6 weeks) for the calendar grid
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth();
  };

  const getDayAppointments = (date: Date) => {
    const dayKey = date.toISOString().split('T')[0];
    return appointmentsByDay[dayKey] || [];
  };

  const isVacationDay = (date: Date) => {
    if (!professional.vacation_active || !professional.vacation_start || !professional.vacation_end) {
      return false;
    }

    // Usar as datas exatamente como estão cadastradas no banco de dados
    const startDate = new Date(professional.vacation_start);
    const endDate = new Date(professional.vacation_end);
    
    // Normalizar as datas para comparação (apenas ano, mês e dia)
    const normalizedCheckDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    return normalizedCheckDate >= normalizedStartDate && normalizedCheckDate <= normalizedEndDate;
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => onNavigateMonth('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <p className="text-sm text-muted-foreground">{professional.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onNavigateMonth('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((date, index) => {
            const dayAppointments = getDayAppointments(date);
            const appointmentCount = dayAppointments.length;
            const isVacation = isVacationDay(date);
            const isTodayDate = isToday(date);
            const isCurrentMonthDate = isCurrentMonth(date);
            
            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all hover:bg-muted/50
                  ${isTodayDate ? 'bg-primary/10 border-primary' : 'border-border'}
                  ${!isCurrentMonthDate ? 'opacity-40' : ''}
                  ${isVacation ? 'bg-orange-100 border-orange-300' : ''}
                `}
                onClick={() => onDayClick(date, dayAppointments)}
              >
                <div className="flex flex-col h-full">
                  {/* Day number */}
                  <div className={`
                    text-sm font-medium mb-1 flex items-center justify-between
                    ${isTodayDate ? 'text-primary font-bold' : ''}
                    ${!isCurrentMonthDate ? 'text-muted-foreground' : ''}
                  `}>
                    <span>{date.getDate()}</span>
                    {isVacation && (
                      <span className="text-xs text-orange-600">🏖️</span>
                    )}
                  </div>
                  
                  {/* Appointment indicators */}
                  <div className="flex-1 space-y-1">
                    {appointmentCount > 0 && (
                      <div className="space-y-1">
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-1 py-0.5 bg-blue-100 text-blue-700"
                        >
                          {appointmentCount} agend.
                        </Badge>
                        
                        {/* Show first few appointments */}
                        {dayAppointments.slice(0, 2).map((appointment, idx) => (
                          <div
                            key={idx}
                            className="text-xs p-1 rounded bg-blue-50 text-blue-700 truncate"
                            title={`${new Date(appointment.startTime).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - ${appointment.patients?.full_name || 'Paciente'}`}
                          >
                            {new Date(appointment.startTime).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        ))}
                        
                        {appointmentCount > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{appointmentCount - 2} mais
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isVacation && (
                      <Badge variant="outline" className="text-xs px-1 py-0.5 bg-orange-50 text-orange-700 border-orange-200">
                        Férias
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary/20 border border-primary"></div>
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-100"></div>
          <span>Com agendamentos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300"></div>
          <span>Férias</span>
        </div>
      </div>
    </div>
  );
}
