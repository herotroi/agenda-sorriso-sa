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
      const calendarContent = calendarContainer?.querySelector('.space-y-6') || calendarContainer;
      
      if (calendarContent) {
        // Clone the content to avoid modifying the original
        const contentClone = calendarContent.cloneNode(true) as HTMLElement;
        
        // Remove interactive elements from the cloned content
        const buttons = contentClone.querySelectorAll('button');
        buttons.forEach(button => button.remove());
        
        contentToPrint = contentClone.innerHTML;
      } else {
        contentToPrint = '<p>Nenhum agendamento encontrado na visualização de calendário.</p>';
      }
    } else {
      // For table view, get the table content
      const tableContainer = document.querySelector('[role="tabpanel"][data-state="active"]');
      const cardContent = tableContainer?.querySelector('.rounded-lg.border');
      
      if (cardContent) {
        // Clone the card content to modify it for printing
        const contentClone = cardContent.cloneNode(true) as HTMLElement;
        
        // Remove action buttons and interactive elements
        const buttons = contentClone.querySelectorAll('button');
        buttons.forEach(button => button.remove());
        
        // Remove the header buttons container
        const headerActions = contentClone.querySelector('.flex.gap-2');
        if (headerActions) {
          headerActions.remove();
        }
        
        // Simplify the table for printing
        const actionCells = contentClone.querySelectorAll('td:last-child');
        actionCells.forEach(cell => {
          if (cell.querySelector('button')) {
            cell.innerHTML = '<span class="text-xs text-gray-500">-</span>';
          }
        });
        
        contentToPrint = contentClone.innerHTML;
      } else {
        contentToPrint = '<p>Nenhum agendamento encontrado na tabela.</p>';
      }
    }

    // Create the print document with improved styling
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Agendamentos - ${currentDate}</title>
          <meta charset="utf-8">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.4;
              color: #333;
              background: white;
              margin: 0;
              padding: 15mm;
              font-size: 12px;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            
            .print-header h1 {
              margin: 0 0 8px 0;
              color: #333;
              font-size: 20px;
              font-weight: bold;
            }
            
            .print-header p {
              margin: 3px 0;
              color: #666;
              font-size: 12px;
            }
            
            .print-content {
              margin-top: 15px;
            }
            
            /* Card styles */
            .rounded-lg {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background: white;
              overflow: hidden;
            }
            
            /* Table styles */
            .overflow-x-auto {
              overflow: visible;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 0;
              font-size: 10px;
              background: white;
            }
            
            th, td {
              border: 1px solid #e5e7eb;
              padding: 6px 4px;
              text-align: left;
              vertical-align: top;
              word-wrap: break-word;
              max-width: 120px;
            }
            
            th {
              background-color: #f9fafb;
              font-weight: 600;
              font-size: 9px;
              color: #374151;
            }
            
            /* Calendar grid styles */
            .grid {
              display: grid;
              gap: 1px;
              border: 1px solid #e5e7eb;
              font-size: 10px;
            }
            
            .space-y-6 > * + * {
              margin-top: 15px;
            }
            
            .space-y-4 > * + * {
              margin-top: 10px;
            }
            
            /* Professional columns */
            .border {
              border: 1px solid #e5e7eb;
            }
            
            .border-r {
              border-right: 1px solid #e5e7eb;
            }
            
            .border-b {
              border-bottom: 1px solid #e5e7eb;
            }
            
            /* Card headers */
            .flex.flex-col.space-y-1\\.5 {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              background: #f9fafb;
            }
            
            .text-2xl {
              font-size: 16px;
              font-weight: 600;
              color: #111827;
            }
            
            .p-6 {
              padding: 12px;
            }
            
            .pt-0 {
              padding-top: 0;
            }
            
            /* Status badges */
            .inline-flex {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 9px;
              background: #f3f4f6 !important;
              color: #374151 !important;
              border: 1px solid #d1d5db;
            }
            
            /* Appointment items */
            .bg-blue-50, .bg-green-50, .bg-yellow-50, .bg-red-50, 
            [class*="bg-"], [style*="background"] {
              background: #f9fafb !important;
              border: 1px solid #e5e7eb !important;
              padding: 4px 6px;
              margin: 2px 0;
              border-radius: 3px;
              font-size: 9px;
            }
            
            /* Text utilities */
            .text-xs {
              font-size: 9px;
            }
            
            .text-sm {
              font-size: 10px;
            }
            
            .font-medium {
              font-weight: 500;
            }
            
            .font-semibold {
              font-weight: 600;
            }
            
            .text-gray-500 {
              color: #6b7280;
            }
            
            .text-gray-600 {
              color: #4b5563;
            }
            
            .text-gray-900 {
              color: #111827;
            }
            
            /* Hide interactive elements */
            button, [role="button"], .cursor-pointer {
              display: none !important;
            }
            
            /* Print specific */
            @media print {
              body { 
                margin: 0 !important;
                padding: 10mm !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .print-header {
                margin-bottom: 15px;
                padding-bottom: 10px;
              }
              
              .print-header h1 {
                font-size: 18px;
              }
              
              table {
                font-size: 9px;
              }
              
              th, td {
                padding: 4px 3px;
              }
              
              .no-print { 
                display: none !important; 
              }
              
              .page-break { 
                page-break-before: always; 
              }
            }
            
            /* Page setup */
            @page {
              margin: 15mm;
              size: A4;
            }
            
            /* Responsive text scaling */
            .h-12 { height: auto; min-height: 30px; }
            .h-\\[60px\\] { height: 45px; }
            .pt-1 { padding-top: 2px; }
            .text-center { text-align: center; }
            .flex.items-center { display: flex; align-items: center; }
            .justify-center { justify-content: center; }
            .items-start { align-items: flex-start; }
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
    }, 1500);
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
