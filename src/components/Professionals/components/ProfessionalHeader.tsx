
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfessionalHeaderProps {
  onAddProfessional: () => void;
  canCreate: boolean;
}

export function ProfessionalHeader({ onAddProfessional, canCreate }: ProfessionalHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
        <p className="text-gray-600">Gerencie os profissionais da sua clínica</p>
      </div>
      <Button 
        onClick={onAddProfessional}
        disabled={!canCreate}
      >
        <Plus className="h-4 w-4 mr-2" />
        Novo Profissional
      </Button>
    </div>
  );
}
