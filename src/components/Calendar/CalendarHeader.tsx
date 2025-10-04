
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarHeaderProps {
  selectedDate: Date;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onNewAppointment: () => void;
  onDateSelect?: (date: Date) => void;
}

export function CalendarHeader({ 
  selectedDate, 
  onNavigateDate, 
  onGoToToday, 
  onNewAppointment,
  onDateSelect 
}: CalendarHeaderProps) {
  const isMobile = useIsMobile();

  const handleDateSelect = (date: Date | undefined) => {
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-2 sm:p-4">
      <div className="flex flex-col space-y-2 sm:space-y-3">
        {/* Primeira linha - Navegação e Data */}
        <div className="flex items-center justify-between gap-2">
          {/* Navegação */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigateDate('prev')}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onGoToToday}
              className="h-8 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
            >
              Hoje
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigateDate('next')}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Seletor de Data e Botão Novo */}
          <div className="flex items-center gap-2 flex-shrink min-w-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 sm:h-9 px-2 sm:px-3 justify-start text-left font-normal min-w-0 max-w-[120px] sm:max-w-none"
                >
                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate text-xs sm:text-sm">
                    {format(selectedDate, isMobile ? "dd/MM/yy" : "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Button 
              onClick={onNewAppointment}
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 flex-shrink-0"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">
                Novo
              </span>
            </Button>
          </div>
        </div>

        {/* Segunda linha - Título da data */}
        <div className="flex items-center justify-center sm:justify-start">
          <div className="font-semibold text-xs sm:text-sm lg:text-base text-center sm:text-left truncate">
            {selectedDate.toLocaleDateString('pt-BR', { 
              weekday: isMobile ? 'short' : 'long', 
              year: 'numeric', 
              month: isMobile ? 'short' : 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
