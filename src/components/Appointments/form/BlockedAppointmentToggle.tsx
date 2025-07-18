
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface BlockedAppointmentToggleProps {
  isBlocked: boolean;
  onChange: (checked: boolean) => void;
}

export function BlockedAppointmentToggle({ isBlocked, onChange }: BlockedAppointmentToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="blocked-appointment"
        checked={isBlocked}
        onCheckedChange={onChange}
      />
      <Label htmlFor="blocked-appointment" className="text-sm font-medium">
        Horário bloqueado
      </Label>
    </div>
  );
}
