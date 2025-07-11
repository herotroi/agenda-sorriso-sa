
import React from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function SidebarNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

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

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-400" />
          <span className="font-semibold text-white">Notificações</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
            title="Marcar todas como lidas"
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-colors",
                  !notification.read 
                    ? "bg-blue-900/20 border-l-2 border-l-blue-500 hover:bg-blue-900/30" 
                    : "hover:bg-slate-800/50"
                )}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        "text-sm truncate",
                        !notification.read ? "font-semibold text-white" : "font-medium text-slate-300"
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(notification.timestamp, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
