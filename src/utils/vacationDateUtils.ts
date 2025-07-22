
/**
 * Utilitário centralizado para parsing e validação de datas de férias
 * Evita problemas de timezone e garante consistência em toda a aplicação
 */

/**
 * Converte uma string de data (YYYY-MM-DD) para um objeto Date normalizado
 * Usa split('-') para evitar problemas de timezone
 */
export const parseVacationDate = (dateString: string): Date => {
  const parts = dateString.split('-');
  return new Date(
    parseInt(parts[0]), // ano
    parseInt(parts[1]) - 1, // mês (0-baseado)
    parseInt(parts[2]) // dia
  );
};

/**
 * Normaliza uma data para comparação (apenas ano, mês e dia)
 */
export const normalizeDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Verifica se uma data está dentro do período de férias
 * @param checkDate - Data a ser verificada
 * @param vacationStart - Data de início das férias (YYYY-MM-DD)
 * @param vacationEnd - Data de fim das férias (YYYY-MM-DD)
 * @returns true se a data está dentro do período de férias (inclusive)
 */
export const isDateInVacationPeriod = (
  checkDate: Date,
  vacationStart: string,
  vacationEnd: string
): boolean => {
  const normalizedCheckDate = normalizeDate(checkDate);
  const vacationStartDate = parseVacationDate(vacationStart);
  const vacationEndDate = parseVacationDate(vacationEnd);
  
  // Garantir que a data final das férias inclua o dia completo
  vacationEndDate.setHours(23, 59, 59, 999);
  
  console.log('Vacation date validation:', {
    checkDate: normalizedCheckDate.toDateString(),
    vacationStartOriginal: vacationStart,
    vacationEndOriginal: vacationEnd,
    vacationStartParsed: vacationStartDate.toDateString(),
    vacationEndParsed: vacationEndDate.toDateString(),
    isInVacation: normalizedCheckDate >= vacationStartDate && normalizedCheckDate <= vacationEndDate,
    comparison: {
      checkTime: normalizedCheckDate.getTime(),
      startTime: vacationStartDate.getTime(),
      endTime: vacationEndDate.getTime()
    }
  });
  
  // Verificar se está dentro do período (inclusive até o final do último dia)
  return normalizedCheckDate >= vacationStartDate && normalizedCheckDate <= vacationEndDate;
};

/**
 * Gera blocos de férias para um profissional em uma data específica
 */
export const generateVacationBlock = (
  professional: { id: string; name: string; vacation_active?: boolean; vacation_start?: string; vacation_end?: string },
  selectedDate: Date
) => {
  if (!professional.vacation_active || !professional.vacation_start || !professional.vacation_end) {
    return null;
  }
  
  // Usar as datas exatas sem ajustes
  if (isDateInVacationPeriod(selectedDate, professional.vacation_start, professional.vacation_end)) {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return {
      id: `vacation-${professional.id}`,
      type: 'vacation' as const,
      professional_id: professional.id,
      start_time: `${dateStr}T00:00:00`,
      end_time: `${dateStr}T23:59:59`,
      title: 'Férias'
    };
  }
  
  return null;
};
