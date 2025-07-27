
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Professional } from '@/types';

interface ProfessionalDetailViewHeaderProps {
  professional: Professional;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onNewAppointment: () => void;
  view: 'day' | 'month';
}

export function ProfessionalDetailViewHeader({
  professional,
  currentDate,
  onDateChange,
  onNewAppointment,
  view
}: ProfessionalDetailViewHeaderProps) {
  const isMobile = useIsMobile();

  const handlePreviousDate = () => {
    const newDate = view === 'day' ? subDays(currentDate, 1) : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    onDateChange(newDate);
  };

  const handleNextDate = () => {
    const newDate = view === 'day' ? addDays(currentDate, 1) : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex flex-col space-y-4 p-4 sm:p-6 border-b bg-white">
      {/* Linha superior - Informações do profissional */}
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: professional.color }}
        />
        <div className="min-w-0 flex-1">
          <h2 className={`font-semibold text-gray-900 truncate ${isMobile ? 'text-base' : 'text-lg'}`}>
            {professional.name}
          </h2>
          {professional.specialty && (
            <p className={`text-gray-500 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {professional.specialty}
            </p>
          )}
        </div>
      </div>

      {/* Linha inferior - Controles de navegação e botão */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        {/* Controles de navegação de data */}
        <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={handlePreviousDate}
            className="flex-shrink-0"
          >
            <ChevronLeft className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={handleToday}
            className={`flex items-center gap-1 min-w-0 ${isMobile ? 'px-2' : 'px-3'}`}
          >
            <CalendarIcon className={`flex-shrink-0 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
            <span className={`truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {view === 'day' 
                ? format(currentDate, isMobile ? "dd/MM" : "dd 'de' MMMM", { locale: ptBR })
                : format(currentDate, isMobile ? "MMM/yy" : "MMMM 'de' yyyy", { locale: ptBR })
              }
            </span>
          </Button>
          
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={handleNextDate}
            className="flex-shrink-0"
          >
            <ChevronRight className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>

        {/* Botão de novo agendamento */}
        <Button 
          onClick={onNewAppointment} 
          size={isMobile ? "sm" : "default"}
          className={`flex items-center gap-1 sm:gap-2 ${isMobile ? 'w-full sm:w-auto' : ''}`}
        >
          <Plus className={`flex-shrink-0 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          <span className={`truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Novo' : 'Novo Agendamento'}
          </span>
        </Button>
      </div>
    </div>
  );
}
