
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, User } from 'lucide-react';

interface ProntuarioHeaderProps {
  selectedPatient: string;
  onNewAppointment: () => void;
  canCreate: boolean;
}

export function ProntuarioHeader({ selectedPatient, onNewAppointment, canCreate }: ProntuarioHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {selectedPatient ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <User className="h-3 w-3 mr-1" />
              Paciente Selecionado
            </Badge>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Nenhum paciente selecionado
          </div>
        )}
      </div>
      
      {selectedPatient && (
        <Button
          onClick={onNewAppointment}
          disabled={!canCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Prontuário
        </Button>
      )}
    </div>
  );
}
