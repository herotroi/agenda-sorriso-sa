
import { ScrollArea } from '@/components/ui/scroll-area';

interface Professional {
  id: string;
  name: string;
  color: string;
}

interface ProfessionalTabsProps {
  professionals: Professional[];
  onProfessionalClick: (professionalId: string) => void;
}

export function ProfessionalTabs({ professionals, onProfessionalClick }: ProfessionalTabsProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex space-x-2 pb-2">
        {professionals.map((prof) => (
          <button
            key={prof.id}
            onClick={() => onProfessionalClick(prof.id)}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ 
              backgroundColor: prof.color + '20',
              color: prof.color,
              border: `1px solid ${prof.color}40`
            }}
          >
            {prof.name}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
