
import { useState } from 'react';
import { ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarNotificationsProps {
  onBack: () => void;
}

// Mock notifications for now - we'll connect to real data later
const mockNotifications = [
  {
    id: '1',
    title: 'Novo agendamento',
    message: 'João Silva agendou uma consulta para hoje às 14:00',
    type: 'appointment',
    timestamp: new Date(),
    isRead: false,
  },
  {
    id: '2',
    title: 'Lembrete de consulta',
    message: 'Maria Santos tem consulta em 30 minutos',
    type: 'reminder',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isRead: false,
  },
  {
    id: '3',
    title: 'Pagamento recebido',
    message: 'Pagamento de R$ 150,00 foi confirmado',
    type: 'payment',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    isRead: true,
  },
];

export function SidebarNotifications({ onBack }: SidebarNotificationsProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-500';
      case 'reminder': return 'bg-yellow-500';
      case 'payment': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-white">Notificações</h2>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Marcar todas
          </Button>
        )}
      </div>

      <div className="p-4">
        {unreadCount > 0 && (
          <Badge variant="secondary" className="mb-4">
            {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-3 rounded-lg border transition-colors cursor-pointer ${
                  notification.isRead
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-700 border-gray-600'
                }`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(notification.type)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium truncate ${
                        notification.isRead ? 'text-gray-300' : 'text-white'
                      }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-400 ml-2">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${
                      notification.isRead ? 'text-gray-400' : 'text-gray-200'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="p-1 h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-600"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
