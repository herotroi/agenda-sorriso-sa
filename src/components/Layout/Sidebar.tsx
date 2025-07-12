
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
  Bell,
  Stethoscope,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/agenda', icon: Calendar, label: 'Agenda' },
    { path: '/pacientes', icon: Users, label: 'Pacientes' },
    { path: '/profissionais', icon: UserCheck, label: 'Profissionais' },
    { path: '/procedimentos', icon: Stethoscope, label: 'Procedimentos' },
    { path: '/prontuario', icon: FileText, label: 'Prontuário' },
    { path: '/notificacoes', icon: Bell, label: 'Notificações', badge: unreadCount },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
    { path: '/assinatura', icon: CreditCard, label: 'Assinatura' },
  ];

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle mobile sidebar
  const handleToggle = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      onToggle();
    }
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Sidebar Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar */}
        <aside className={cn(
          "fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out border-r border-sidebar-border flex flex-col z-50 w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center w-full">
                <img 
                  src="/lovable-uploads/b34aff0f-970c-47af-97bc-4aa0f15e9826.png" 
                  alt="Herotroi Clinic" 
                  className="h-12 w-auto object-contain"
                />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
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
                    "flex items-center px-3 py-3 rounded-lg transition-colors group relative",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="ml-3 truncate">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu Button */}
        <button
          onClick={handleToggle}
          className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-sidebar text-sidebar-foreground hover:bg-slate-700 transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border flex flex-col z-50",
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
            onClick={handleToggle}
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
