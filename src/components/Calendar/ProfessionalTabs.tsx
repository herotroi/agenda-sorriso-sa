
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { usePrintReport } from '@/components/Agenda/hooks/usePrintReport';

interface Professional {
  id: string;
  name: string;
  color: string;
}

interface ProfessionalTabsProps {
  professionals: Professional[];
  onProfessionalClick: (professionalId: string) => void;
  selectedDate?: Date;
}

export function ProfessionalTabs({ professionals, onProfessionalClick, selectedDate }: ProfessionalTabsProps) {
  const { handlePrint } = usePrintReport();

  const handlePrintProfessional = (professional: Professional, event: React.MouseEvent) => {
    event.stopPropagation();
    handlePrint('calendar', selectedDate, professional.id);
  };

  return (
    <ScrollArea className="w-full">
      <div className="flex space-x-2 pb-2">
        {professionals.map((prof) => (
          <div
            key={prof.id}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ 
              backgroundColor: prof.color + '20',
              color: prof.color,
              borderColor: prof.color + '40'
            }}
          >
            <button
              onClick={() => onProfessionalClick(prof.id)}
              className="hover:opacity-80 transition-opacity"
            >
              {prof.name}
            </button>
            <Button
              onClick={(e) => handlePrintProfessional(prof, e)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent"
              title={`Imprimir relatório de ${prof.name}`}
            >
              <Printer className="h-3 w-3" style={{ color: prof.color }} />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
