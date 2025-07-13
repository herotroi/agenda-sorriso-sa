import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { Appointment } from '@/types';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  appointment_id?: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      console.log('📊 Fetching notifications from database...');
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        console.log('📊 Loaded notifications from database:', data?.length || 0);
        setNotifications(data || []);
        setUnreadCount((data || []).filter(n => !n.read).length);
        
        updateNotificationState({
          total: data?.length || 0,
          unread: (data || []).filter(n => !n.read).length,
          notifications: data || []
        });
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [user]);

  const updateNotificationState = (state: { total: number; unread: number; notifications: any[] }) => {
    console.log('📊 Notifications updated:', state);
  };

  console.log('🔔 NotificationDropdown render:', {
    notificationsCount: notifications.length,
    unreadCount: unreadCount
  });

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // If notification is about an appointment, fetch and show appointment details
    if (notification.appointment_id) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            patients(full_name),
            professionals(name),
            procedures(name),
            appointment_statuses(label, color)
          `)
          .eq('id', notification.appointment_id)
          .single();

        if (error) throw error;

        if (data) {
          const mappedAppointment = {
            ...data,
            startTime: data.start_time,
            endTime: data.end_time,
            patientId: data.patient_id,
            professionalId: data.professional_id,
            procedureId: data.procedure_id,
            date: new Date(data.start_time).toISOString().split('T')[0]
          };
          setSelectedAppointment(mappedAppointment);
          setIsAppointmentDetailsOpen(true);
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error);
      }
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            {unreadCount > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                variant="destructive"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-2 border-b">
            <h3 className="font-semibold">Notificações</h3>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                Limpar todas
              </Button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-3 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex flex-col space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${!notification.read ? 'text-primary' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          isOpen={isAppointmentDetailsOpen}
          onClose={() => {
            setIsAppointmentDetailsOpen(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </>
  );
}
