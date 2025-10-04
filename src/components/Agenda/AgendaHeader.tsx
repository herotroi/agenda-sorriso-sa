
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AgendaHeaderProps {
  onPrint: () => void;
}

export function AgendaHeader({ onPrint }: AgendaHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Agenda
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
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
