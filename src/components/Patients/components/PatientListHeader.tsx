
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';

interface PatientListHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddPatient: () => void;
}

export function PatientListHeader({ viewMode, onViewModeChange, onAddPatient }: PatientListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
        <p className="text-gray-600">Gerencie os pacientes da clínica</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={onAddPatient}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Paciente
        </Button>
      </div>
    </div>
  );
}
