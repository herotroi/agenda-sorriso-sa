
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  UserPlus, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  FileText,
  Menu,
  X,
  Stethoscope,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarNotifications } from './SidebarNotifications';
import { useNotifications } from '@/contexts/NotificationContext';

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: Users, label: 'Pacientes', path: '/pacientes' },
  { icon: UserPlus, label: 'Profissionais', path: '/profissionais' },
  { icon: ClipboardList, label: 'Procedimentos', path: '/procedimentos' },
  { icon: FileText, label: 'Prontuário', path: '/prontuario' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  if (showNotifications) {
    return (
      <div className="bg-slate-900 text-white w-80 h-screen transition-all duration-300 flex flex-col">
        {/* Header with back button */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <SidebarNotifications />
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-slate-900 text-white h-screen transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">ClinicPro</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
          
          {/* Notifications Button */}
          <li>
            <button
              onClick={toggleNotifications}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-colors w-full",
                "text-slate-300 hover:bg-slate-800 hover:text-white relative"
              )}
            >
              <Bell className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Notificações</span>}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">DR</span>
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium">Dr. Silva</p>
              <p className="text-xs text-slate-400">Administrador</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
