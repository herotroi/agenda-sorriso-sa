
import { useState } from 'react';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { AppointmentsTable } from '@/components/Appointments/AppointmentsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Table } from 'lucide-react';

export default function Agenda() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-600">Gerencie os agendamentos da clínica</p>
      </div>
      
      <Tabs defaultValue="calendar" className="w-full">
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
    </div>
  );
}
