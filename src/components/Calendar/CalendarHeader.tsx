
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
      <div className="flex flex-col space-y-3">
        {/* Primeira linha - Navegação e Data */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              onClick={() => onNavigateDate('prev')}
              className={cn(
                "flex-shrink-0",
                isMobile ? "px-2" : ""
              )}
            >
              <ChevronLeft className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              {!isMobile && <span className="ml-1">Anterior</span>}
            </Button>
            
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              onClick={onGoToToday}
              className={cn(
                "whitespace-nowrap flex-shrink-0",
                isMobile ? "text-xs px-2" : ""
              )}
            >
              Hoje
            </Button>
            
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              onClick={() => onNavigateDate('next')}
              className={cn(
                "flex-shrink-0",
                isMobile ? "px-2" : ""
              )}
            >
              <ChevronRight className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              {!isMobile && <span className="mr-1">Próximo</span>}
            </Button>
          </div>

          {/* Seletor de Data */}
          <div className="flex items-center justify-center sm:justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className={cn(
                    "justify-start text-left font-normal min-w-0",
                    isMobile ? "text-xs px-2" : "w-auto"
                  )}
                >
                  <CalendarIcon className={cn(
                    "mr-1 flex-shrink-0",
                    isMobile ? "h-3 w-3" : "h-4 w-4"
                  )} />
                  <span className="truncate">
                    {format(selectedDate, isMobile ? "dd/MM/yy" : "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
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
          </div>
        </div>

        {/* Segunda linha - Título da data e botão novo agendamento */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className={cn(
            "font-semibold text-center sm:text-left",
            isMobile ? "text-sm" : "text-base lg:text-lg"
          )}>
            {selectedDate.toLocaleDateString('pt-BR', { 
              weekday: isMobile ? 'short' : 'long', 
              year: 'numeric', 
              month: isMobile ? 'short' : 'long', 
              day: 'numeric' 
            })}
          </div>

          <Button 
            onClick={onNewAppointment}
            size={isMobile ? "sm" : "default"}
            className={cn(
              "flex-shrink-0",
              isMobile ? "w-full" : "w-auto"
            )}
          >
            <Plus className={cn(
              "mr-1 sm:mr-2 flex-shrink-0",
              isMobile ? "h-3 w-3" : "h-4 w-4"
            )} />
            <span className={cn(
              "truncate",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {isMobile ? "Novo" : "Novo Agendamento"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
