
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck } from 'lucide-react';
import { Professional } from '@/types/appointment-form';
import { FormField } from './FormField';

interface ProfessionalSelectorProps {
  professionals: Professional[];
  value: string;
  onChange: (value: string) => void;
  currentProfessionalName?: string;
}

export function ProfessionalSelector({ professionals, value, onChange, currentProfessionalName }: ProfessionalSelectorProps) {
  return (
    <FormField 
      label="Profissional" 
      required 
      currentValue={currentProfessionalName}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Selecione o profissional" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {professionals.map((prof) => (
            <SelectItem key={prof.id} value={prof.id}>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                {prof.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
