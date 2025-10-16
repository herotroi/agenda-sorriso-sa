
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from './types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// In-memory idempotency guard to prevent duplicate inserts from race conditions
const inFlightNotificationKeys = new Map<string, number>();

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
      // In-memory idempotency guard to avoid race-condition duplicates across rapid events
      const key = `${notification.type}:${notification.appointmentId ?? 'none'}`;
      const now = Date.now();
      const last = inFlightNotificationKeys.get(key);
      if (last && now - last < 2500) {
        console.log('⏭️ Skipping in-memory duplicate notification', { key });
        return;
      }
      inFlightNotificationKeys.set(key, now);
      setTimeout(() => inFlightNotificationKeys.delete(key), 3000);

      // Verificar duplicatas recentes (últimos 3 segundos) com mesmo tipo e appointment_id
      const timeWindowAgo = new Date(Date.now() - 3000).toISOString();
      
      let query = supabase
        .from('notifications')
        .select('id, appointment_id')
        .eq('user_id', user.id)
        .eq('type', notification.type)
        .gte('created_at', timeWindowAgo);

      // Se tem appointment_id, verificar duplicatas com mesmo appointment_id
      if (notification.appointmentId) {
        query = query.eq('appointment_id', notification.appointmentId);
      }

      const { data: existingNotifications, error: checkError } = await query;

      if (checkError) {
        console.error('Error checking for duplicate notifications:', checkError);
      }

      if (existingNotifications && existingNotifications.length > 0) {
        console.log('📢 Duplicate notification detected, skipping insert');
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          appointment_id: notification.appointmentId,
          user_id: user.id,
        });

      if (error) {
        console.error('Error inserting notification:', error);
        return;
      }
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
      });

      console.log('📢 Notification added to database (realtime will update state)');
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
