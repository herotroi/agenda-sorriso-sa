
import { Input } from '@/components/ui/input';
import { Timer } from 'lucide-react';
import { FormField } from './FormField';

interface DurationInputProps {
  value: string;
  onChange: (value: string) => void;
  currentValue?: string;
}

export function DurationInput({ value, onChange, currentValue }: DurationInputProps) {
  return (
    <FormField 
      label="Duração (min)" 
      currentValue={currentValue ? `${currentValue} min` : undefined}
    >
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Timer className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="1"
          className="pl-10"
          placeholder="60"
        />
      </div>
    </FormField>
  );
}
