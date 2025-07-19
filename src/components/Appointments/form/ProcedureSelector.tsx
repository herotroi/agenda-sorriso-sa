
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, DollarSign } from 'lucide-react';
import { Procedure } from '@/types/appointment-form';
import { FormField } from './FormField';

interface ProcedureSelectorProps {
  procedures: Procedure[];
  value: string;
  onChange: (value: string) => void;
  currentProcedureName?: string;
  disabled?: boolean;
}

export function ProcedureSelector({ 
  procedures, 
  value, 
  onChange, 
  currentProcedureName,
  disabled = false
}: ProcedureSelectorProps) {
  return (
    <FormField 
      label="Procedimento" 
      currentValue={currentProcedureName}
    >
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Selecione o procedimento" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {procedures.map((procedure) => (
            <SelectItem key={procedure.id} value={procedure.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  {procedure.name}
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-sm">R$ {procedure.price.toFixed(2)}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
