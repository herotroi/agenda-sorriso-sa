
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, User } from 'lucide-react';

interface ProntuarioHeaderProps {
  selectedPatient: string;
  onNewAppointment: () => void;
  canCreate: boolean;
}

export function ProntuarioHeader({ selectedPatient, onNewAppointment, canCreate }: ProntuarioHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 w-full">
        {selectedPatient ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm whitespace-nowrap">
            <User className="h-3 w-3 mr-1 flex-shrink-0" />
            Paciente Selecionado
          </Badge>
        ) : (
          <div className="text-xs sm:text-sm text-gray-500">
            Nenhum paciente selecionado
          </div>
        )}
      </div>
      
      {selectedPatient && (
        <div className="flex flex-wrap gap-2 w-full">
          <Button
            onClick={onNewAppointment}
            disabled={!canCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none min-w-[200px] text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Novo Prontuário</span>
          </Button>
        </div>
      )}
    </div>
  );
}
