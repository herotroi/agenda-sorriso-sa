
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { Professional, Procedure } from '@/types/appointment-form';
import { FormField } from './FormField';

interface ProfessionalSelectorProps {
  professionals: Professional[];
  procedures: Procedure[];
  value: string;
  onChange: (value: string) => void;
  currentProfessionalName?: string;
  selectedProcedureId?: string;
  isBlocked?: boolean;
}

export function ProfessionalSelector({ 
  professionals, 
  procedures,
  value, 
  onChange, 
  currentProfessionalName,
  selectedProcedureId,
  isBlocked = false
}: ProfessionalSelectorProps) {
  // Para horários bloqueados, mostrar todos os profissionais ativos
  // Para agendamentos normais, filtrar apenas os profissionais habilitados para o procedimento
  const filteredProfessionals = isBlocked 
    ? professionals.filter(prof => prof.active !== false)
    : professionals.filter(professional => {
        // Se não há procedimento selecionado, não mostrar nenhum profissional
        if (!selectedProcedureId) return false;
        
        // Encontrar o procedimento selecionado
        const selectedProcedure = procedures.find(proc => proc.id === selectedProcedureId);
        
        // Se o procedimento tem profissionais associados, verificar se o profissional está na lista
        if (selectedProcedure?.professionals && selectedProcedure.professionals.length > 0) {
          return selectedProcedure.professionals.some(prof => prof.id === professional.id);
        }
        
        // Se o procedimento não tem profissionais associados, não mostrar nenhum profissional
        return false;
      });

  const hasOption = value && filteredProfessionals.some(p => p.id === value);

  const getPlaceholder = () => {
    if (isBlocked) {
      return "Selecione o profissional";
    }
    return selectedProcedureId ? "Selecione o profissional" : "Selecione primeiro um procedimento";
  };

  return (
    <FormField 
      label="Profissional" 
      currentValue={currentProfessionalName}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={getPlaceholder()} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {!hasOption && value && currentProfessionalName && (
            <SelectItem value={value}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {currentProfessionalName}
              </div>
            </SelectItem>
          )}
          {!isBlocked && !selectedProcedureId && (
            <div className="px-2 py-1 text-sm text-gray-500">
              Selecione primeiro um procedimento
            </div>
          )}
          {!isBlocked && selectedProcedureId && filteredProfessionals.length === 0 && (
            <div className="px-2 py-1 text-sm text-gray-500">
              Nenhum profissional habilitado para este procedimento
            </div>
          )}
          {filteredProfessionals.map((professional) => (
            <SelectItem key={professional.id} value={professional.id}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {professional.name}
                {professional.specialty && (
                  <span className="text-xs text-gray-500">({professional.specialty})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
