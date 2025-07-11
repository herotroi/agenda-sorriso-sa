
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
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    console.log('🔔 Setting up appointment change notifications...');
    
    const channel = supabase
      .channel('appointment-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('📝 Appointment updated:', payload);
          
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
              addNotification({
                title: 'Agendamento Alterado',
                message: `Agendamento foi modificado: ${changes.join(', ')}`,
                type: 'appointment_updated'
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
          console.log('➕ New appointment created:', payload);
          addNotification({
            title: 'Novo Agendamento',
            message: 'Um novo agendamento foi criado',
            type: 'appointment_created'
          });
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
          console.log('🗑️ Appointment deleted:', payload);
          addNotification({
            title: 'Agendamento Excluído',
            message: 'Um agendamento foi excluído',
            type: 'appointment_deleted'
          });
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Cleaning up appointment notifications...');
      supabase.removeChannel(channel);
    };
  }, []);

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
