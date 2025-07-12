
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Table } from 'lucide-react';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { AppointmentsTable } from '@/components/Appointments/AppointmentsTable';
import { useIsMobile } from '@/hooks/use-mobile';

interface AgendaTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onFiltersChange: (filters: { statusId?: number; procedureId?: string }) => void;
}

export function AgendaTabs({ 
  activeTab, 
  onTabChange, 
  selectedDate, 
  onDateChange,
  onFiltersChange 
}: AgendaTabsProps) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full">
      <Tabs defaultValue="calendar" value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'mb-4' : 'mb-6'}`}>
          <TabsTrigger value="calendar" className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            {isMobile ? 'Calendário' : 'Visualização Calendário'}
          </TabsTrigger>
          <TabsTrigger value="table" className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <Table className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            {isMobile ? 'Tabela' : 'Tabela de Agendamentos'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className={`${isMobile ? 'mt-2' : 'mt-6'}`}>
          <CalendarView selectedDate={selectedDate} onDateChange={onDateChange} />
        </TabsContent>
        
        <TabsContent value="table" className={`${isMobile ? 'mt-2' : 'mt-6'}`}>
          <AppointmentsTable onFiltersChange={onFiltersChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
