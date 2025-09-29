
import { User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/agenda':
        return 'Agenda';
      case '/pacientes':
        return 'Pacientes';
      case '/profissionais':
        return 'Profissionais';
      case '/procedimentos':
        return 'Procedimentos';
      case '/prontuario':
        return 'Prontuário';
      case '/configuracoes':
        return 'Configurações';
      case '/assinatura':
        return 'Assinatura';
      case '/notificacoes':
        return 'Notificações';
      default:
        return 'ClinicPro';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h1 className={cn(
            "font-semibold text-gray-900",
            isMobile ? "text-lg ml-12" : "text-xl md:text-2xl"
          )}>
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size={isMobile ? "sm" : "default"}>
                <User className={cn("h-4 w-4", !isMobile && "sm:h-5 sm:w-5")} />
                {!isMobile && <span className="ml-2 hidden sm:inline">Perfil</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              <DropdownMenuLabel className="text-sm">
                {user?.email || 'Usuário'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
