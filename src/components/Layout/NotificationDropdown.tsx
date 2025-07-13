
import { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { Appointment, AppointmentStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  console.log('🔔 NotificationDropdown render:', {
    notificationsCount: notifications.length,
    unreadCount
  });

  const handleNotificationClick = async (notification: any) => {
    if (notification.appointmentId) {
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
          .eq('id', notification.appointmentId)
          .single();

        if (error) throw error;

        if (data) {
          // Helper function to map status
          const mapStatus = (status: string | null): AppointmentStatus => {
            if (!status) return 'confirmado';
            const validStatuses: AppointmentStatus[] = ['confirmado', 'cancelado', 'faltou', 'em-andamento', 'concluido'];
            return validStatuses.includes(status as AppointmentStatus) ? status as AppointmentStatus : 'confirmado';
          };

          const appointment: Appointment = {
            id: data.id,
            professionalId: data.professional_id,
            patientId: data.patient_id,
            date: new Date(data.start_time).toISOString().split('T')[0],
            startTime: data.start_time,
            endTime: data.end_time,
            procedureId: data.procedure_id,
            status: mapStatus(data.status),
            notes: data.notes,
            createdAt: data.created_at || new Date().toISOString(),
            // Database fields
            created_at: data.created_at,
            end_time: data.end_time,
            patient_id: data.patient_id,
            price: data.price,
            procedure_id: data.procedure_id,
            professional_id: data.professional_id,
            start_time: data.start_time,
            status_id: data.status_id,
            updated_at: data.updated_at,
            user_id: data.user_id,
            // Joined table fields
            patients: data.patients,
            professionals: data.professionals,
            procedures: data.procedures,
            appointment_statuses: data.appointment_statuses
          };

          setSelectedAppointment(appointment);
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
      }
    }

    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleDeleteNotification = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_created':
        return '📅';
      case 'appointment_updated':
        return '✏️';
      case 'appointment_cancelled':
        return '❌';
      default:
        return '🔔';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notificações
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} não lidas</Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start gap-2 p-3 cursor-pointer ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(notification.timestamp.toISOString())}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:text-destructive"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={() => {}}
        />
      )}
    </>
  );
}
