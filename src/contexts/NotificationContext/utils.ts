
import { Notification } from './types';

export const createNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification => {
  return {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: new Date(),
    read: false,
  };
};

export const detectAppointmentChanges = (oldAppointment: any, newAppointment: any): string[] => {
  const changes: string[] = [];
  
  if (oldAppointment.start_time !== newAppointment.start_time) {
    changes.push('horário');
  }
  if (oldAppointment.status_id !== newAppointment.status_id) {
    changes.push('status');
  }
  if (oldAppointment.professional_id !== newAppointment.professional_id) {
    changes.push('profissional');
  }
  if (oldAppointment.procedure_id !== newAppointment.procedure_id) {
    changes.push('procedimento');
  }
  if (oldAppointment.notes !== newAppointment.notes) {
    changes.push('observações');
  }
  
  return changes;
};
