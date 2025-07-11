
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface PatientFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
}

export function PatientFilters({ 
  searchTerm, 
  setSearchTerm, 
  showInactive, 
  setShowInactive 
}: PatientFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Pesquisar pacientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="show-inactive"
          checked={showInactive}
          onCheckedChange={setShowInactive}
        />
        <Label htmlFor="show-inactive">Mostrar inativos</Label>
      </div>
    </div>
  );
}
