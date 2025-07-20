
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { usePrintReport } from '@/components/Agenda/hooks/usePrintReport';
import type { Professional } from '@/types';

interface PrintButtonProps {
  professional: Professional;
  currentDate: Date;
  view: 'day' | 'month';
}

export function PrintButton({ professional, currentDate, view }: PrintButtonProps) {
  const { handlePrint } = usePrintReport();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintClick = async () => {
    if (isPrinting) return;
    
    setIsPrinting(true);
    try {
      if (view === 'day') {
        // Imprimir calendário do dia específico para este profissional
        await handlePrint('calendar', currentDate, professional.id);
      } else {
        // Para visão mensal, imprimir tabela dos agendamentos do mês
        await handlePrint('table', currentDate, professional.id);
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrintClick}
      disabled={isPrinting}
      className="flex items-center gap-2"
    >
      <Printer className="h-4 w-4" />
      {isPrinting ? 'Imprimindo...' : 'Imprimir'}
    </Button>
  );
}
