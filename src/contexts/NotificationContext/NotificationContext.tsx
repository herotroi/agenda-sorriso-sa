
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationContextType } from './types';
import { useNotificationActions } from './useNotificationActions';
import { useNotificationData } from './useNotificationData';
import { useRealtimeSubscription } from './useRealtimeSubscription';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from database
  useNotificationData({ setNotifications });

  const { addNotification, markAsRead, markAllAsRead } = useNotificationActions({
    notifications,
    setNotifications,
  });

  useRealtimeSubscription({ addNotification });

  const unreadCount = notifications.filter(n => !n.read).length;

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
