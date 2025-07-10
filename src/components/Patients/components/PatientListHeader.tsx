
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PatientListHeaderProps {
  onNewPatient: () => void;
}

export function PatientListHeader({ onNewPatient }: PatientListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
        <p className="text-gray-600">Gerencie os pacientes da clínica</p>
      </div>
      <Button onClick={onNewPatient}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Paciente
      </Button>
    </div>
  );
}
