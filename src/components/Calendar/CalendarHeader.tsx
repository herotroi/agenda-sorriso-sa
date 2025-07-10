
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarHeaderProps {
  selectedDate: Date;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onNewAppointment: () => void;
}

export function CalendarHeader({ 
  selectedDate, 
  onNavigateDate, 
  onGoToToday, 
  onNewAppointment 
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onNavigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onGoToToday}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold ml-4">
            {selectedDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      <Button onClick={onNewAppointment}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Agendamento
      </Button>
    </div>
  );
}
