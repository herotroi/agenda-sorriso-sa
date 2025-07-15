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
  
  // Verificar se está dentro do período (inclusive)
  return normalizedCheckDate >= vacationStartDate && normalizedCheckDate <= vacationEndDate;
};

/**
 * Ajusta as datas de férias para começar e terminar um dia antes
 */
const adjustVacationDates = (vacationStart: string, vacationEnd: string) => {
  const startDate = parseVacationDate(vacationStart);
  const endDate = parseVacationDate(vacationEnd);
  
  // Subtrair um dia das datas de início e fim
  startDate.setDate(startDate.getDate() - 1);
  endDate.setDate(endDate.getDate() - 1);
  
  return {
    adjustedStart: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`,
    adjustedEnd: `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
  };
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
  
  // Ajustar as datas para começar e terminar um dia antes
  const { adjustedStart, adjustedEnd } = adjustVacationDates(professional.vacation_start, professional.vacation_end);
  
  if (isDateInVacationPeriod(selectedDate, adjustedStart, adjustedEnd)) {
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