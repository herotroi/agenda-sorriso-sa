
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        <div className="flex items-center justify-center sm:justify-start space-x-2">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={() => onNavigateDate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
            {!isMobile && <span className="ml-1 hidden sm:inline">Anterior</span>}
          </Button>
          
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={onGoToToday}
            className="whitespace-nowrap"
          >
            Hoje
          </Button>
          
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={() => onNavigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
            {!isMobile && <span className="mr-1 hidden sm:inline">Próximo</span>}
          </Button>
        </div>
        
        <div className={cn(
          "font-semibold text-center sm:text-left",
          isMobile ? "text-base" : "text-lg"
        )}>
          {selectedDate.toLocaleDateString('pt-BR', { 
            weekday: isMobile ? 'short' : 'long', 
            year: 'numeric', 
            month: isMobile ? 'short' : 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <Button 
        onClick={onNewAppointment}
        size={isMobile ? "sm" : "default"}
        className="w-full sm:w-auto"
      >
        <Plus className="h-4 w-4 mr-1 sm:mr-2" />
        <span className={isMobile ? "text-sm" : "text-base"}>
          {isMobile ? "Novo" : "Novo Agendamento"}
        </span>
      </Button>
    </div>
  );
}
