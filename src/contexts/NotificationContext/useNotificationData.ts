
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
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
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
  }, [setNotifications]);
};
