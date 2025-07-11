
import { Appointment, AppointmentDisplayType } from './types';

export const convertToLocalTime = (isoString: string): Date => {
  return new Date(isoString);
};

export const getStatusColor = (appointment: Appointment): string => {
  if (appointment.appointment_statuses?.color) {
    return appointment.appointment_statuses.color;
  }
  
  // Fallback colors based on status
  const status = appointment.appointment_statuses?.label || 'Confirmado';
  switch (status) {
    case 'Confirmado': return '#10b981';
    case 'Cancelado': return '#ef4444';
    case 'Não Compareceu': return '#6b7280';
    case 'Em atendimento': return '#3b82f6';
    case 'Finalizado': return '#8b5cf6';
    default: return '#6b7280';
  }
};

export const getAppointmentDurationInHours = (startTime: string, endTime: string): number => {
  const start = convertToLocalTime(startTime);
  const end = convertToLocalTime(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export const shouldShowAppointmentInHour = (appointment: Appointment, hour: number): boolean => {
  const startTime = convertToLocalTime(appointment.start_time);
  const endTime = convertToLocalTime(appointment.end_time);
  
  const startHour = startTime.getHours();
  const startMinutes = startTime.getMinutes();
  const endHour = endTime.getHours();
  const endMinutes = endTime.getMinutes();
  
  // Verificar se o agendamento começa nesta hora
  if (startHour === hour) return true;
  
  // Verificar se o agendamento está em andamento nesta hora (só para horas intermediárias)
  if (hour > startHour && hour < endHour) return true;
  
  // Para agendamentos que terminam em uma hora específica, só mostrar se não começaram na mesma hora
  // e se terminam com minutos > 0
  if (hour === endHour && endMinutes > 0 && startHour !== endHour) return true;
  
  return false;
};

export const getAppointmentDisplayType = (appointment: Appointment, hour: number): AppointmentDisplayType => {
  const startTime = convertToLocalTime(appointment.start_time);
  const endTime = convertToLocalTime(appointment.end_time);
  
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const endMinutes = endTime.getMinutes();
  
  // Se começar nesta hora, sempre é 'start' (mesmo que termine na mesma hora)
  if (startHour === hour) {
    return 'start';
  }
  
  // Se terminar nesta hora (com minutos > 0) e não começar na mesma hora
  if (endHour === hour && endMinutes > 0 && startHour !== endHour) {
    return 'end';
  }
  
  // Caso contrário, é continuação
  return 'continuation';
};
