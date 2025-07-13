
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProntuarioHeaderProps {
  selectedPatient: string;
  onNewAppointment: () => void;
  canCreate: boolean;
}

export function ProntuarioHeader({ selectedPatient, onNewAppointment, canCreate }: ProntuarioHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prontuário Eletrônico</h1>
          <p className="text-gray-600">Gerencie os registros médicos dos pacientes</p>
        </div>
      </div>
      
      {selectedPatient && (
        <Button 
          onClick={onNewAppointment}
          disabled={!canCreate}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Consulta
        </Button>
      )}
    </div>
  );
}
