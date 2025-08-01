
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'appointment_updated' | 'appointment_created' | 'appointment_deleted' | 'appointment_reminder';
  appointmentId?: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  deleteNotification: (id: string) => void;
  createAppointmentFromNotification?: (notificationId: string, appointmentData: any) => Promise<void>;
}
