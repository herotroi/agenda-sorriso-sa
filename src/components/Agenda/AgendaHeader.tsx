
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface AgendaHeaderProps {
  onPrint: () => void;
}

export function AgendaHeader({ onPrint }: AgendaHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-600">Gerencie os agendamentos da clínica</p>
      </div>
      
      <Button 
        onClick={onPrint}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Imprimir Relatório
      </Button>
    </div>
  );
}
