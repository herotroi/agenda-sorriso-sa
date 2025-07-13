
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function useAppointmentValidation(professionals: any[], procedures: any[], statuses: any[]) {
  const validateFieldValue = (field: string, value: string): ValidationResult => {
    console.log(`🔍 Validating field ${field} with value:`, value);

    switch (field) {
      case 'professional_id':
        const professionalExists = professionals.find(p => p.id === value);
        if (!professionalExists) {
          return { isValid: false, error: 'Profissional não encontrado' };
        }
        break;
      
      case 'procedure_id':
        if (value && value !== '') {
          const procedureExists = procedures.find(p => p.id === value);
          if (!procedureExists) {
            return { isValid: false, error: 'Procedimento não encontrado' };
          }
        }
        break;
      
      case 'status_id':
        const statusId = parseInt(value);
        if (isNaN(statusId)) {
          return { isValid: false, error: 'Status inválido' };
        }
        const statusExists = statuses.find(s => s.id === statusId);
        if (!statusExists) {
          return { isValid: false, error: 'Status não encontrado' };
        }
        break;
      
      case 'start_time':
        const startDate = new Date(value);
        if (isNaN(startDate.getTime())) {
          return { isValid: false, error: 'Data/hora inválida' };
        }
        if (startDate < new Date()) {
          return { isValid: false, error: 'Não é possível agendar para o passado' };
        }
        break;
    }

    return { isValid: true };
  };

  return { validateFieldValue };
}
