
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from './types';
import { useToast } from '@/hooks/use-toast';

interface UseNotificationActionsProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export const useNotificationActions = ({ notifications, setNotifications }: UseNotificationActionsProps) => {
  const { toast } = useToast();

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    console.log('📢 Adding notification to database:', notification);
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          appointment_id: notification.appointmentId
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting notification:', error);
        return;
      }

      // Convert database notification to our format
      const newNotification: Notification = {
        id: data.id,
        title: data.title,
        message: data.message,
        type: data.type as any,
        timestamp: new Date(data.created_at),
        read: data.read,
        appointmentId: data.appointment_id || undefined
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
      });

      console.log('📢 Notification added to database and state');
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [setNotifications, toast]);

  const markAsRead = useCallback(async (id: string) => {
    console.log('📖 Marking notification as read in database:', id);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        console.error('Error updating notification:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [setNotifications]);

  const markAllAsRead = useCallback(async () => {
    console.log('📖 Marking all notifications as read in database');
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        console.error('Error updating all notifications:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [setNotifications]);

  return {
    addNotification,
    markAsRead,
    markAllAsRead,
  };
};
