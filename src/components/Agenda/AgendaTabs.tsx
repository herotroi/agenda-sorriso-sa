
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
        <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'mb-4 h-12' : 'mb-6 h-12'}`}>
          <TabsTrigger value="calendar" className="flex items-center justify-center gap-2 text-sm font-medium">
            <Calendar className="h-5 w-5" />
            <span>Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center justify-center gap-2 text-sm font-medium">
            <Table className="h-5 w-5" />
            <span>Tabela</span>
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
