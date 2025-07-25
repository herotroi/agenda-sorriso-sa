
import { Bell, X, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/contexts/NotificationContext';
import { Appointment } from '@/types';

export function NotificationDropdown() {
  const { 
    notifications, 
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createAppointmentFromNotification
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'appointment_cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCreateAppointment = async (notification: any) => {
    if (!createAppointmentFromNotification) {
      console.warn('createAppointmentFromNotification is not available');
      return;
    }

    try {
      const appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'date' | 'status'> = {
        patient_id: null,
        professional_id: notification.appointment_id,
        procedure_id: null,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        notes: `Criado a partir da notificação: ${notification.title}`,
        price: null,
        status_id: 1,
        user_id: '', // Will be set by the backend
        is_blocked: false
      };

      await createAppointmentFromNotification(notification.id, appointmentData);
    } catch (error) {
      console.error('Error creating appointment from notification:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        {notifications.length > 0 ? (
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Notificações</CardTitle>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {notification.type === 'appointment_reminder' && createAppointmentFromNotification && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateAppointment(notification)}
                        className="text-xs"
                      >
                        Criar Agendamento
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Nenhuma notificação
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
