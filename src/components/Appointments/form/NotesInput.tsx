
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { FormField } from './FormField';

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
  currentValue?: string;
}

export function NotesInput({ value, onChange, currentValue }: NotesInputProps) {
  const formatCurrentValue = (notes: string) => {
    if (!notes) return '';
    return notes.length > 30 ? notes.substring(0, 30) + '...' : notes;
  };

  return (
    <FormField 
      label="Observações" 
      currentValue={currentValue ? formatCurrentValue(currentValue) : undefined}
    >
      <div className="relative">
        <div className="absolute left-3 top-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite suas observações..."
          rows={3}
          className="pl-10 resize-none"
        />
      </div>
    </FormField>
  );
}
