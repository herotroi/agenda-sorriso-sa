
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface ProfessionalDetailViewHeaderProps {
  onBack: () => void;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  searchDate: string;
  onSearchDateChange: (date: string) => void;
  onSearchDate: () => void;
  onNewAppointment: () => void;
}

export function ProfessionalDetailViewHeader({
  onBack,
  onNavigateDate,
  onGoToToday,
  searchDate,
  onSearchDateChange,
  onSearchDate,
  onNewAppointment
}: ProfessionalDetailViewHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
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
        </div>

        <div className="flex items-center space-x-2">
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => onSearchDateChange(e.target.value)}
            placeholder="Buscar data..."
            className="w-40"
          />
          <Button variant="outline" size="sm" onClick={onSearchDate}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button onClick={onNewAppointment}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Agendamento
      </Button>
    </div>
  );
}
