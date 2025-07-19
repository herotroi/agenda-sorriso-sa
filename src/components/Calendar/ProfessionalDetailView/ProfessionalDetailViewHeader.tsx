
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Professional } from '@/types';

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
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoje
          </Button>
        </div>
        <div>
          <h3 className="text-lg font-semibold">{professional.name}</h3>
          <p className="text-sm text-muted-foreground">
            {format(currentDate, view === 'day' ? "EEEE, dd 'de' MMMM 'de' yyyy" : "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>
      
      <Button onClick={onNewAppointment} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Novo Agendamento
      </Button>
    </div>
  );
}
