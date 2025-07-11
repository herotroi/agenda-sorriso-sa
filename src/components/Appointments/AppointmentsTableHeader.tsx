
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw, Plus } from 'lucide-react';

interface AppointmentsTableHeaderProps {
  appointmentsCount: number;
  hasActiveFilters: boolean;
  onCreateAppointment: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function AppointmentsTableHeader({
  appointmentsCount,
  hasActiveFilters,
  onCreateAppointment,
  onRefresh,
  refreshing
}: AppointmentsTableHeaderProps) {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <div className="flex flex-col">
            <span>Tabela de Agendamentos</span>
            {hasActiveFilters && (
              <span className="text-sm font-normal text-muted-foreground">
                {appointmentsCount} resultado{appointmentsCount !== 1 ? 's' : ''} encontrado{appointmentsCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={onCreateAppointment}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardTitle>
    </CardHeader>
  );
}
