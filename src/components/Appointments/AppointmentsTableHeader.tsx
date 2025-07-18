
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
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">Agendamentos</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {appointmentsCount} {hasActiveFilters ? 'filtrados' : 'total'}
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          
          <Button
            onClick={onCreateAppointment}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
