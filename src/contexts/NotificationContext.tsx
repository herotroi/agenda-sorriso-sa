
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'appointment_updated' | 'appointment_created' | 'appointment_deleted';
  appointmentId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    console.log('📢 Adding notification:', notification);
    
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep only last 50 notifications
    
    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
    });

    console.log('📢 Notification added, total notifications:', notifications.length + 1);
  };

  const markAsRead = (id: string) => {
    console.log('📖 Marking notification as read:', id);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    console.log('📖 Marking all notifications as read');
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    console.log('🔔 Setting up appointment change notifications...');
    
    // Create a unique channel name
    const channelName = `appointment-changes-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('📝 Appointment updated payload:', payload);
          
          if (payload.new && payload.old) {
            const oldAppointment = payload.old as any;
            const newAppointment = payload.new as any;
            
            // Check what changed
            let changes: string[] = [];
            
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
            
            if (changes.length > 0) {
              console.log('📝 Changes detected:', changes);
              addNotification({
                title: 'Agendamento Alterado',
                message: `Agendamento foi modificado: ${changes.join(', ')}`,
                type: 'appointment_updated',
                appointmentId: newAppointment.id
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('➕ New appointment created payload:', payload);
          if (payload.new) {
            const newAppointment = payload.new as any;
            addNotification({
              title: 'Novo Agendamento',
              message: 'Um novo agendamento foi criado',
              type: 'appointment_created',
              appointmentId: newAppointment.id
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('🗑️ Appointment deleted payload:', payload);
          if (payload.old) {
            const deletedAppointment = payload.old as any;
            addNotification({
              title: 'Agendamento Excluído',
              message: 'Um agendamento foi excluído',
              type: 'appointment_deleted',
              appointmentId: deletedAppointment.id
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('🔗 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to appointment changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to channel');
        }
      });

    return () => {
      console.log('🔕 Cleaning up appointment notifications...');
      supabase.removeChannel(channel);
    };
  }, []);

  // Debug effect to log notification changes
  useEffect(() => {
    console.log('📊 Notifications updated:', {
      total: notifications.length,
      unread: unreadCount,
      notifications: notifications.map(n => ({ title: n.title, read: n.read, appointmentId: n.appointmentId }))
    });
  }, [notifications, unreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
