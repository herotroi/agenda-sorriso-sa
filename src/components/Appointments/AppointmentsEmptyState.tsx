
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AppointmentsEmptyStateProps {
  hasActiveFilters: boolean;
  onCreateAppointment: () => void;
}

export function AppointmentsEmptyState({ hasActiveFilters, onCreateAppointment }: AppointmentsEmptyStateProps) {
  return (
    <div className="text-center py-8">
      <div className="text-gray-500 mb-4">
        {hasActiveFilters 
          ? 'Nenhum agendamento encontrado com os filtros selecionados'
          : 'Nenhum agendamento encontrado'
        }
      </div>
      {!hasActiveFilters && (
        <Button onClick={onCreateAppointment}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Primeiro Agendamento
        </Button>
      )}
    </div>
  );
}
