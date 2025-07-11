
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, DollarSign } from 'lucide-react';
import { Procedure } from '@/types/appointment-form';
import { FormField } from './FormField';

interface ProcedureSelectorProps {
  procedures: Procedure[];
  value: string;
  onChange: (value: string) => void;
  currentProcedureName?: string;
  selectedProfessionalId?: string;
}

export function ProcedureSelector({ 
  procedures, 
  value, 
  onChange, 
  currentProcedureName,
  selectedProfessionalId 
}: ProcedureSelectorProps) {
  // Filtrar procedimentos baseado no profissional selecionado
  const filteredProcedures = procedures.filter(procedure => {
    // Se não há profissional selecionado, não mostrar nenhum procedimento
    if (!selectedProfessionalId) return false;
    
    // Se o procedimento tem profissionais associados, verificar se o profissional selecionado está na lista
    if (procedure.professionals && procedure.professionals.length > 0) {
      return procedure.professionals.some(prof => prof.id === selectedProfessionalId);
    }
    
    // Se o procedimento não tem profissionais associados, não mostrar
    return false;
  });

  return (
    <FormField 
      label="Procedimento" 
      currentValue={currentProcedureName}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={selectedProfessionalId ? "Selecione o procedimento" : "Selecione primeiro um profissional"} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {!selectedProfessionalId && (
            <div className="px-2 py-1 text-sm text-gray-500">
              Selecione primeiro um profissional
            </div>
          )}
          {selectedProfessionalId && filteredProcedures.length === 0 && (
            <div className="px-2 py-1 text-sm text-gray-500">
              Nenhum procedimento disponível para este profissional
            </div>
          )}
          {filteredProcedures.map((procedure) => (
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
