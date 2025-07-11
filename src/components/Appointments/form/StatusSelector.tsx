
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from 'lucide-react';
import { AppointmentStatus } from '@/types/appointment-form';
import { FormField } from './FormField';

interface StatusSelectorProps {
  statuses: AppointmentStatus[];
  value: string;
  onChange: (value: string) => void;
  currentStatusName?: string;
}

export function StatusSelector({ statuses, value, onChange, currentStatusName }: StatusSelectorProps) {
  return (
    <FormField 
      label="Status" 
      currentValue={currentStatusName}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Badge className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Selecione o status" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.id} value={status.id.toString()}>
              <div className="flex items-center gap-2">
                <Badge className="h-4 w-4" />
                {status.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
