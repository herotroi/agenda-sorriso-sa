import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarContent, CalendarGrid, CalendarHeader } from '@/components/ui/calendar';
import { Appointment, Professional } from '@/types';

interface MonthViewProps {
  professional: Professional;
  appointments: Appointment[];
  selectedDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onDayClick: (date: Date, appointments?: Appointment[]) => void;
}

export function MonthView({ 
  professional, 
  appointments, 
  selectedDate, 
  onNavigateMonth, 
  onDayClick 
}: MonthViewProps) {
  const appointmentsByDay = appointments.reduce((acc: { [key: string]: Appointment[] }, appointment) => {
    const day = new Date(appointment.startTime).toISOString().split('T')[0];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(appointment);
    return acc;
  }, {});

  return (
    <CalendarContent>
      <CalendarHeader>
        <Button variant="ghost" size="sm" onClick={() => onNavigateMonth('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center text-sm font-medium">
          {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
        <Button variant="ghost" size="sm" onClick={() => onNavigateMonth('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CalendarHeader>
      <CalendarGrid>
        <Calendar
          mode="single"
          showOutsideDays
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              const appointmentsForDay = appointmentsByDay[date.toISOString().split('T')[0]] || [];
              onDayClick(date, appointmentsForDay);
            }
          }}
        />
      </CalendarGrid>
    </CalendarContent>
  );
}
