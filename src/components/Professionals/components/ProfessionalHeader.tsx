
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProfessionalHeaderProps {
  onAddProfessional: () => void;
}

export function ProfessionalHeader({ onAddProfessional }: ProfessionalHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
        <p className="text-gray-600">Gerencie os profissionais da clínica</p>
      </div>
      <Button onClick={onAddProfessional}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Profissional
      </Button>
    </div>
  );
}
