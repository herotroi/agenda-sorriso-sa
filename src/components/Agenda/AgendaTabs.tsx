
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Table } from 'lucide-react';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { AppointmentsTable } from '@/components/Appointments/AppointmentsTable';

interface AgendaTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function AgendaTabs({ activeTab, onTabChange }: AgendaTabsProps) {
  return (
    <Tabs defaultValue="calendar" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Visualização Calendário
        </TabsTrigger>
        <TabsTrigger value="table" className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          Tabela de Agendamentos
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="calendar" className="mt-6">
        <CalendarView />
      </TabsContent>
      
      <TabsContent value="table" className="mt-6">
        <AppointmentsTable />
      </TabsContent>
    </Tabs>
  );
}
