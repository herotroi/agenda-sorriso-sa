
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from './types';

interface UseNotificationDataProps {
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export const useNotificationData = ({ setNotifications }: UseNotificationDataProps) => {
  useEffect(() => {
    const fetchNotifications = async () => {
      console.log('📊 Fetching notifications from database...');
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('📊 No user found, skipping notification fetch');
          return;
        }

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        const notifications: Notification[] = data.map(item => ({
          id: item.id,
          title: item.title,
          message: item.message,
          type: item.type as any,
          timestamp: new Date(item.created_at),
          read: item.read,
          appointmentId: item.appointment_id || undefined
        }));

        setNotifications(notifications);
        console.log('📊 Loaded notifications from database:', notifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Setup realtime subscription for notifications table
    const setupRealtimeNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      console.log('🔔 Setting up realtime notifications subscription...');
      
      const notificationsChannel = supabase
        .channel(`notifications-realtime-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 New notification received:', payload);
            if (payload.new) {
              const newNotification: Notification = {
                id: payload.new.id,
                title: payload.new.title,
                message: payload.new.message,
                type: payload.new.type as any,
                timestamp: new Date(payload.new.created_at),
                read: payload.new.read,
                appointmentId: payload.new.appointment_id || undefined
              };
              
              setNotifications((prev) => [newNotification, ...prev]);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 Notification updated:', payload);
            if (payload.new) {
              setNotifications((prev) =>
                prev.map((notif) =>
                  notif.id === payload.new.id
                    ? {
                        ...notif,
                        read: payload.new.read,
                        title: payload.new.title,
                        message: payload.new.message
                      }
                    : notif
                )
              );
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 Notification deleted:', payload);
            if (payload.old) {
              setNotifications((prev) =>
                prev.filter((notif) => notif.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe((status) => {
          console.log('🔗 Notifications subscription status:', status);
        });

      return notificationsChannel;
    };

    const channelPromise = setupRealtimeNotifications();

    return () => {
      channelPromise.then((channel) => {
        if (channel) {
          console.log('🔕 Cleaning up notifications subscription...');
          supabase.removeChannel(channel);
        }
      });
    };
  }, [setNotifications]);
};
