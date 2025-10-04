
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AgendaHeaderProps {
  onPrint: () => void;
}

export function AgendaHeader({ onPrint }: AgendaHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
      <div>
        <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          Agenda
        </h1>
        <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
          Gerencie os agendamentos da clínica
        </p>
      </div>
      
      <Button 
        onClick={onPrint}
        variant="outline"
        className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-6"
        size="default"
      >
        <Printer className="h-5 w-5" />
        <span className="font-medium">Imprimir</span>
      </Button>
    </div>
  );
}
