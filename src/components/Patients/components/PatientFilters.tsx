
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface PatientFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
}

export function PatientFilters({
  searchTerm,
  onSearchChange,
  showInactive,
  onShowInactiveChange,
}: PatientFiltersProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar por nome, CPF ou telefone..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="show-inactive"
          checked={showInactive}
          onCheckedChange={onShowInactiveChange}
        />
        <Label htmlFor="show-inactive" className="text-sm">
          Mostrar inativos
        </Label>
      </div>
    </div>
  );
}
