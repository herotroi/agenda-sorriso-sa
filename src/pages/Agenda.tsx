
import { useState } from 'react';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { AppointmentsTable } from '@/components/Appointments/AppointmentsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Table, Printer } from 'lucide-react';

export default function Agenda() {
  const [activeTab, setActiveTab] = useState('calendar');

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

    let contentToPrint = '';
    
    if (activeTab === 'calendar') {
      // For calendar view, get the calendar grid content
      const calendarContainer = document.querySelector('[role="tabpanel"][data-state="active"]');
      const calendarGrid = calendarContainer?.querySelector('[data-testid="calendar-grid"]') || 
                          calendarContainer?.querySelector('.grid') ||
                          calendarContainer;
      
      if (calendarGrid) {
        contentToPrint = calendarGrid.innerHTML;
      } else {
        contentToPrint = '<p>Nenhum agendamento encontrado na visualização de calendário.</p>';
      }
    } else {
      // For table view, get the table content
      const tableContainer = document.querySelector('[role="tabpanel"][data-state="active"]');
      const table = tableContainer?.querySelector('table');
      
      if (table) {
        // Clone the table to modify it for printing
        const tableClone = table.cloneNode(true) as HTMLElement;
        
        // Remove action buttons from the cloned table
        const actionCells = tableClone.querySelectorAll('td:last-child');
        actionCells.forEach(cell => {
          const button = cell.querySelector('button');
          if (button) {
            cell.innerHTML = '<span class="text-xs text-gray-500">-</span>';
          }
        });
        
        contentToPrint = `
          <div class="table-container">
            ${tableClone.outerHTML}
          </div>
        `;
      } else {
        contentToPrint = '<p>Nenhum agendamento encontrado na tabela.</p>';
      }
    }

    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Agendamentos - ${currentDate}</title>
          <meta charset="utf-8">
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 20px;
              line-height: 1.5;
              color: #333;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .print-header h1 {
              margin: 0 0 10px 0;
              color: #333;
              font-size: 24px;
              font-weight: bold;
            }
            .print-header p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            .print-content {
              margin-top: 20px;
            }
            
            /* Table styles */
            .table-container {
              overflow: visible;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              font-size: 11px;
            }
            
            /* Calendar styles */
            .grid {
              display: grid;
              gap: 1px;
              border: 1px solid #ddd;
            }
            .professional-column, [class*="border"] {
              border: 1px solid #ddd;
              padding: 8px;
              margin-bottom: 10px;
              page-break-inside: avoid;
            }
            .appointment-item, [class*="bg-"] {
              background: #f9f9f9 !important;
              border: 1px solid #e0e0e0;
              padding: 6px;
              margin: 3px 0;
              border-radius: 4px;
              font-size: 11px;
            }
            
            /* Status badges */
            span[class*="inline-flex"] {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              background: #f0f0f0 !important;
              color: #333 !important;
            }
            
            /* Hide interactive elements */
            button, [role="button"] {
              display: none !important;
            }
            
            /* Print specific */
            @media print {
              body { 
                margin: 0; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print { display: none !important; }
              .page-break { page-break-before: always; }
            }
            
            /* Responsive adjustments */
            @page {
              margin: 1cm;
              size: A4;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Relatório de Agendamentos</h1>
            <p>Data: ${currentDate}</p>
            <p>Visualização: ${activeTab === 'calendar' ? 'Calendário' : 'Tabela'}</p>
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
    }, 1000);
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
      
      <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
