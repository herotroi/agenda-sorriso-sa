
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from './types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UseNotificationActionsProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export const useNotificationActions = ({ notifications, setNotifications }: UseNotificationActionsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    console.log('📢 Adding notification to database:', notification);
    
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    try {
      // Para notificações de UPDATE, apenas verificar dentro de 2 segundos (mais permissivo)
      // Para CREATE/DELETE, verificar se já existe
      const timeWindowSeconds = notification.type === 'appointment_updated' ? 2 : 5;
      const timeWindowAgo = new Date(Date.now() - (timeWindowSeconds * 1000)).toISOString();
      
      const { data: existingNotifications, error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', notification.type)
        .gte('created_at', timeWindowAgo);

      if (checkError) {
        console.error('Error checking for duplicate notifications:', checkError);
      }

      // Para CREATE e DELETE, verificar também o appointment_id
      if (notification.type === 'appointment_created' || notification.type === 'appointment_deleted') {
        const duplicateExists = existingNotifications?.some(
          n => n.id !== undefined
        );
        
        if (duplicateExists && existingNotifications && existingNotifications.length > 0) {
          console.log('📢 Duplicate notification detected, skipping insert');
          return;
        }
      } else if (notification.type === 'appointment_updated') {
        // Para UPDATE, apenas verificar duplicatas nos últimos 2 segundos
        if (existingNotifications && existingNotifications.length > 0) {
          console.log('📢 Recent update notification detected, skipping insert');
          return;
        }
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          appointment_id: notification.appointmentId,
          user_id: user.id,
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
  }, [setNotifications, toast, user]);

  const markAsRead = useCallback(async (id: string) => {
    console.log('📖 Marking notification as read in database:', id);
    
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

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
  }, [setNotifications, user]);

  const markAllAsRead = useCallback(async () => {
    console.log('📖 Marking all notifications as read in database');
    
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false)
        .eq('user_id', user.id);

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
  }, [setNotifications, user]);

  const deleteNotification = useCallback(async (id: string) => {
    console.log('🗑️ Deleting notification from database:', id);
    
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      setNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [setNotifications, user]);

  return {
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
