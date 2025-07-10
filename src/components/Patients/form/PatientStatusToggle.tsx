
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PatientStatusToggleProps {
  active: boolean;
  onToggle: (active: boolean) => void;
}

export function PatientStatusToggle({ active, onToggle }: PatientStatusToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <Label htmlFor="patient-active" className="text-sm font-medium">
          Status do Paciente
        </Label>
        <p className="text-sm text-gray-600">
          {active ? 'Paciente ativo no sistema' : 'Paciente desativado'}
        </p>
      </div>
      <Switch
        id="patient-active"
        checked={active}
        onCheckedChange={onToggle}
      />
    </div>
  );
}
