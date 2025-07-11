
import { useState } from 'react';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { AppointmentsTable } from '@/components/Appointments/AppointmentsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Table, Printer } from 'lucide-react';

export default function Agenda() {
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the current date for the report
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get the content to print based on active tab
    const activeTab = document.querySelector('[data-state="active"]');
    const isCalendarView = activeTab?.textContent?.includes('Calendário');
    
    let contentToPrint = '';
    if (isCalendarView) {
      // For calendar view, get the calendar content
      const calendarContent = document.querySelector('[data-state="active"] + div')?.innerHTML || '';
      contentToPrint = calendarContent;
    } else {
      // For table view, get the table content
      const tableContent = document.querySelector('[data-state="active"] + div')?.innerHTML || '';
      contentToPrint = tableContent;
    }

    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Agendamentos - ${currentDate}</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 20px;
              line-height: 1.5;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .print-header h1 {
              margin: 0;
              color: #333;
              font-size: 24px;
            }
            .print-header p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            .print-content {
              margin-top: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .calendar-grid {
              display: grid;
              gap: 10px;
            }
            .professional-column {
              border: 1px solid #ddd;
              padding: 10px;
              margin-bottom: 20px;
            }
            .appointment-item {
              background: #f9f9f9;
              border: 1px solid #e0e0e0;
              padding: 8px;
              margin: 5px 0;
              border-radius: 4px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Relatório de Agendamentos</h1>
            <p>Data: ${currentDate}</p>
            <p>Visualização: ${isCalendarView ? 'Calendário' : 'Tabela'}</p>
          </div>
          <div class="print-content">
            ${contentToPrint}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Gerencie os agendamentos da clínica</p>
        </div>
        
        <Button 
          onClick={handlePrint}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir Relatório
        </Button>
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
