
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 
    | 'appointment_created' 
    | 'appointment_updated' 
    | 'appointment_deleted' 
    | 'appointment_reminder'
    | 'patient_created'
    | 'patient_updated'
    | 'patient_deleted'
    | 'procedure_created'
    | 'procedure_updated'
    | 'procedure_deleted'
    | 'record_created'
    | 'record_updated'
    | 'record_deleted'
    | 'settings_updated';
  appointmentId?: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}
