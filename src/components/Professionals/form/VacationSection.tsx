
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface VacationSectionProps {
  vacationActive: boolean;
  vacationStart: string;
  vacationEnd: string;
  onVacationActiveChange: (active: boolean) => void;
  onVacationStartChange: (date: string) => void;
  onVacationEndChange: (date: string) => void;
}

export function VacationSection({
  vacationActive,
  vacationStart,
  vacationEnd,
  onVacationActiveChange,
  onVacationStartChange,
  onVacationEndChange,
}: VacationSectionProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Férias</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="vacation-active"
            checked={vacationActive}
            onCheckedChange={onVacationActiveChange}
          />
          <Label htmlFor="vacation-active" className="text-sm">
            {vacationActive ? 'Ativas' : 'Inativas'}
          </Label>
        </div>
      </div>
      
      {vacationActive && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vacation-start" className="text-xs text-gray-600">Data de Início</Label>
            <Input
              id="vacation-start"
              type="date"
              value={vacationStart}
              onChange={(e) => onVacationStartChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="vacation-end" className="text-xs text-gray-600">Data de Fim</Label>
            <Input
              id="vacation-end"
              type="date"
              value={vacationEnd}
              onChange={(e) => onVacationEndChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
