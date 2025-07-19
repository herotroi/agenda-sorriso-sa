
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
    <div className="flex items-center justify-between p-6 border-b">
      <div className="flex items-center gap-4">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: professional.color }}
        />
        <div>
          <h2 className="text-lg font-semibold">{professional.name}</h2>
          {professional.specialty && (
            <p className="text-sm text-gray-500">{professional.specialty}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousDate}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            <CalendarIcon className="h-4 w-4 mr-1" />
            {view === 'day' 
              ? format(currentDate, "dd 'de' MMMM", { locale: ptBR })
              : format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })
            }
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextDate}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onNewAppointment} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>
    </div>
  );
}
