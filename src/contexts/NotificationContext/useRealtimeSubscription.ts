
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from './types';
import { detectAppointmentChanges } from './utils';
import { useAuth } from '@/contexts/AuthContext';

interface UseRealtimeSubscriptionProps {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

export const useRealtimeSubscription = ({ addNotification }: UseRealtimeSubscriptionProps) => {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    console.log('🔔 Setting up appointment change notifications...');
    
    // Channel name por usuário para evitar múltiplas subscrições
    const channelName = `appointment-changes-${user.id}`;
    
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
            
            const changes = detectAppointmentChanges(oldAppointment, newAppointment);
            
            if (changes.length > 0 && newAppointment.user_id === user.id) {
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
            if (newAppointment.user_id !== user.id) return; // ignore other users
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
            if (deletedAppointment.user_id !== user.id) return; // ignore other users
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
  }, [addNotification, user?.id]);
};
