
import React from 'react';
import { Bell, Check, CheckCheck, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Notificacoes() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const { toast } = useToast();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_updated':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'appointment_created':
        return <Bell className="h-5 w-5 text-green-500" />;
      case 'appointment_deleted':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Notificação excluída com sucesso',
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir notificação',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all notifications

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram excluídas',
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir todas as notificações',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Notificações</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 
                  ? `${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}`
                  : 'Todas as notificações foram lidas'
                }
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button 
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todas como lidas
              </Button>
            )}
            
            {notifications.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Excluir todas
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir todas as notificações? 
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAll}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir todas
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
              <p className="text-muted-foreground text-center">
                Você não tem notificações no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`transition-colors ${
                  !notification.read 
                    ? 'border-l-4 border-l-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${
                              !notification.read ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                Nova
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(notification.timestamp, {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                            {notification.appointmentId && (
                              <Badge variant="outline" className="text-xs">
                                Consulta: {notification.appointmentId.slice(0, 8)}...
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta notificação? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
