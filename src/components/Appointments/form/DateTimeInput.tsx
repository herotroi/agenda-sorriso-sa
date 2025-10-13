import { Input } from '@/components/ui/input';
import { Calendar, Clock } from 'lucide-react';
import { FormField } from './FormField';
import { formatDateTime } from '@/utils/timezoneUtils';

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  currentValue?: string;
}

export function DateTimeInput({ value, onChange, currentValue }: DateTimeInputProps) {
  const formatCurrentValue = (dateTime: string) => {
    if (!dateTime) return '';
    return formatDateTime(dateTime);
  };

  return (
    <FormField 
      label="Data e Hora" 
      required 
      currentValue={currentValue ? formatCurrentValue(currentValue) : undefined}
    >
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12"
          required
        />
      </div>
    </FormField>
  );
}
