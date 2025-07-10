
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProntuarioHeaderProps {
  selectedPatient: string;
  onNewAppointment: () => void;
}

export function ProntuarioHeader({ selectedPatient, onNewAppointment }: ProntuarioHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prontuário Eletrônico</h1>
        <p className="text-gray-600">Gerencie prontuários e documentos dos pacientes</p>
      </div>
      {selectedPatient && (
        <Button onClick={onNewAppointment}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Consulta
        </Button>
      )}
    </div>
  );
}
