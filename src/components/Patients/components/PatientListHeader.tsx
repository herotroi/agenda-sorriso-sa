
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';

interface PatientListHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddPatient: () => void;
}

export function PatientListHeader({ viewMode, onViewModeChange, onAddPatient }: PatientListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
        <p className="text-muted-foreground">
          Gerencie os pacientes da clínica
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex border border-border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-md px-3"
          >
            <Grid className="h-4 w-4" />
            <span className="sr-only">Vista em grade</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-md px-3"
          >
            <List className="h-4 w-4" />
            <span className="sr-only">Vista em lista</span>
          </Button>
        </div>

        {/* Add Patient Button */}
        <Button onClick={onAddPatient} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Paciente
        </Button>
      </div>
    </div>
  );
}
