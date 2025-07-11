import React, { useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext/NotificationContext';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/components/Appointments/types';

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('🔔 NotificationDropdown render:', { 
    notificationsCount: notifications.length, 
    unreadCount 
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_updated':
        return '📝';
      case 'appointment_created':
        return '➕';
      case 'appointment_deleted':
        return '🗑️';
      default:
        return '🔔';
    }
  };

  const fetchAppointmentDetails = async (appointmentId: string) => {
    setIsLoading(true);
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
        .eq('id', appointmentId)
        .single();

      if (error) {
        console.error('Error fetching appointment:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    console.log('📖 Clicking notification:', notification.id);
    markAsRead(notification.id);

    // Se a notificação tem um appointmentId e não é de exclusão, buscar os detalhes
    if (notification.appointmentId && notification.type !== 'appointment_deleted') {
      const appointmentDetails = await fetchAppointmentDetails(notification.appointmentId);
      if (appointmentDetails) {
        setSelectedAppointment(appointmentDetails);
      }
    }
  };

  const handleMarkAllAsRead = () => {
    console.log('📖 Marking all as read');
    markAllAsRead();
  };

  const handleCloseAppointmentDetails = () => {
    setSelectedAppointment(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notificações</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto p-1"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma notificação
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  } ${isLoading ? 'opacity-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={handleCloseAppointmentDetails}
          onUpdate={handleCloseAppointmentDetails}
        />
      )}
    </>
  );
}
