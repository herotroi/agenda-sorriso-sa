
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
    <CardHeader className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Primeira linha - Título e Badge */}
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm sm:text-base md:text-lg">Agendamentos</CardTitle>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-800 font-semibold">
            {appointmentsCount} {hasActiveFilters ? 'filtrados' : 'total'}
          </Badge>
        </div>
        
        {/* Segunda linha - Botões */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="h-8 sm:h-9 px-3 text-xs sm:text-sm flex items-center gap-1.5 flex-1 sm:flex-none min-w-[100px]"
          >
            <Printer className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Imprimir</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-8 sm:h-9 px-3 text-xs sm:text-sm flex items-center gap-1.5 flex-1 sm:flex-none min-w-[100px]"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </Button>
          
          <Button
            onClick={onCreateAppointment}
            size="sm"
            className="h-8 sm:h-9 px-3 text-xs sm:text-sm flex items-center gap-1.5 flex-1 sm:flex-none min-w-[140px]"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Novo</span>
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
