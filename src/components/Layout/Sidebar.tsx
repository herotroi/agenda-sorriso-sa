
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar,
  Users,
  UserCheck,
  Settings,
  BarChart3,
  FileText,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotification } from '@/contexts/NotificationContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { unreadCount } = useNotification();

  const menuItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/agenda', icon: Calendar, label: 'Agenda' },
    { path: '/pacientes', icon: Users, label: 'Pacientes' },
    { path: '/profissionais', icon: UserCheck, label: 'Profissionais' },
    { path: '/procedimentos', icon: Settings, label: 'Procedimentos' },
    { path: '/prontuario', icon: FileText, label: 'Prontuário' },
    { path: '/notificacoes', icon: Bell, label: 'Notificações', badge: unreadCount },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
    { path: '/assinatura', icon: BarChart3, label: 'Assinatura' },
  ];

  return (
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <img 
                src="/lovable-uploads/b34aff0f-970c-47af-97bc-4aa0f15e9826.png" 
                alt="Herotroi Clinic" 
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors group relative",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
              {item.badge && item.badge > 0 && (
                <span className={cn(
                  "ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center",
                  isCollapsed && "absolute -top-1 -right-1"
                )}>
                  {item.badge}
                </span>
              )}
              
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
