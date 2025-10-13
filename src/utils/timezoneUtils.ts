/**
 * Utilitários centralizados para manipulação de timezone
 * Timezone padrão: America/Sao_Paulo
 */

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

/**
 * Obtém o timezone configurado do usuário (será implementado com hook)
 */
export function getUserTimezone(): string {
  // Por enquanto retorna o padrão, será substituído por chamada ao hook
  return DEFAULT_TIMEZONE;
}

/**
 * Converte uma data do timezone local para UTC (para salvar no banco)
 */
export function toUTC(localDate: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  return new Date(localDate.toLocaleString('en-US', { timeZone: 'UTC' }));
}

/**
 * Converte uma data UTC para o timezone local
 */
export function fromUTC(utcDate: Date | string, timezone: string = DEFAULT_TIMEZONE): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Formata uma data para exibição no timezone local
 */
export function formatDateTime(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('pt-BR', {
    timeZone: timezone,
    ...options,
  });
}

/**
 * Formata apenas a data (sem hora)
 */
export function formatDate(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return formatDateTime(date, timezone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Formata apenas a hora
 */
export function formatTime(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return formatDateTime(date, timezone, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Cria uma data no timezone local a partir de componentes (ano, mês, dia, hora, minuto)
 */
export function createLocalDate(
  year: number,
  month: number,
  day: number,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0
): Date {
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Obtém o início do dia no timezone local
 */
export function getStartOfDay(date: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
}

/**
 * Obtém o fim do dia no timezone local
 */
export function getEndOfDay(date: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  const localDate = new Date(date);
  localDate.setHours(23, 59, 59, 999);
  return localDate;
}

/**
 * Converte string datetime-local (YYYY-MM-DDTHH:mm) para Date no timezone local
 */
export function parseLocalDateTime(datetimeLocal: string): Date {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(datetimeLocal)) {
    const [datePart, timePart] = datetimeLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return createLocalDate(year, month, day, hours, minutes, 0);
  }
  return new Date(datetimeLocal);
}

/**
 * Converte Date para formato datetime-local (YYYY-MM-DDTHH:mm)
 */
export function toDateTimeLocalString(date: Date | string, timezone: string = DEFAULT_TIMEZONE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Obter componentes no timezone local
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
