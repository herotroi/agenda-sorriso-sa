
import { useCallback } from 'react';
import { Notification } from './types';
import { createNotification } from './utils';
import { useToast } from '@/hooks/use-toast';

interface UseNotificationActionsProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export const useNotificationActions = ({ notifications, setNotifications }: UseNotificationActionsProps) => {
  const { toast } = useToast();

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    console.log('📢 Adding notification:', notification);
    
    const newNotification = createNotification(notification);

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep only last 50 notifications
    
    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
    });

    console.log('📢 Notification added, total notifications:', notifications.length + 1);
  }, [notifications.length, setNotifications, toast]);

  const markAsRead = useCallback((id: string) => {
    console.log('📖 Marking notification as read:', id);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, [setNotifications]);

  const markAllAsRead = useCallback(() => {
    console.log('📖 Marking all notifications as read');
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, [setNotifications]);

  return {
    addNotification,
    markAsRead,
    markAllAsRead,
  };
};
