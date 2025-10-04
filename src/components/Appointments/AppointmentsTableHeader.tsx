
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AppointmentsTableHeaderProps {
  appointmentsCount: number;
  hasActiveFilters: boolean;
  onCreateAppointment: () => void;
  onRefresh: () => void;
  onPrint: () => void;
  refreshing: boolean;
}

export function AppointmentsTableHeader({
  appointmentsCount,
  hasActiveFilters,
  onCreateAppointment,
  onRefresh,
  onPrint,
  refreshing
}: AppointmentsTableHeaderProps) {
  return (
    <CardHeader className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base sm:text-lg">Agendamentos</CardTitle>
          <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-0.5">
            {appointmentsCount} {hasActiveFilters ? 'filtrados' : 'total'}
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={onPrint}
            className="flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px] w-full sm:w-auto"
          >
            <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Imprimir</span>
          </Button>
          
          <Button
            variant="outline"
            size="default"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px] w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </Button>
          
          <Button
            onClick={onCreateAppointment}
            size="default"
            className="flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px] w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Novo Agendamento</span>
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
