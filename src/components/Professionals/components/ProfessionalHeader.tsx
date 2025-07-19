
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProfessionalHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  totalCount: number;
  filteredCount: number;
}

export function ProfessionalHeader({ 
  searchTerm, 
  onSearchChange, 
  onAddClick, 
  totalCount, 
  filteredCount 
}: ProfessionalHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-600">
            Gerencie os profissionais da sua clínica 
            {totalCount !== filteredCount && ` (${filteredCount} de ${totalCount})`}
          </p>
        </div>
        <Button onClick={onAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Profissional
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por nome ou especialidade..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
