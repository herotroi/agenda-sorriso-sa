
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Stethoscope, 
  FileText, 
  Settings, 
  CreditCard,
  LayoutDashboard,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarNotifications } from './SidebarNotifications';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Profissionais', href: '/profissionais', icon: UserCheck },
  { name: 'Procedimentos', href: '/procedimentos', icon: Stethoscope },
  { name: 'Prontuário', href: '/prontuario', icon: FileText },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
  { name: 'Assinatura', href: '/assinatura', icon: CreditCard },
];

export function Sidebar() {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notification count for now - we'll connect to real data later
  const unreadCount = 3;

  if (showNotifications) {
    return <SidebarNotifications onBack={() => setShowNotifications(false)} />;
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">ClinicPro</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotifications(true)}
          className="relative text-white hover:bg-gray-800"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )}
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
