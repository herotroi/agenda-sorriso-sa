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
              font-size: 11px;
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
              font-size: 18px;
              font-weight: bold;
            }
            
            .print-header p {
              margin: 3px 0;
              color: #666;
              font-size: 11px;
            }
            
            .print-content {
              margin-top: 15px;
              overflow: visible;
            }
            
            /* Card styles */
            .rounded-lg {
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              background: white;
              overflow: visible;
            }
            
            /* Calendar Grid - Critical fixes for alignment */
            .grid {
              display: grid !important;
              gap: 0 !important;
              border: 1px solid #ccc;
              font-size: 9px;
              width: 100%;
              position: relative;
            }
            
            /* Ensure grid maintains its column structure */
            .grid > div {
              position: relative !important;
              border-right: 1px solid #e5e7eb;
              border-bottom: 1px solid #e5e7eb;
            }
            
            /* Hour column styling */
            .grid > div:first-child {
              background: #f9fafb;
              font-weight: 600;
            }
            
            /* Professional columns */
            .grid > div:not(:first-child) {
              min-height: 40px;
              position: relative;
            }
            
            /* Time slot cells */
            .grid > div > div {
              height: 40px !important;
              border-bottom: 1px solid #f3f4f6;
              position: relative;
              display: flex;
              align-items: flex-start;
              padding: 2px;
            }
            
            /* Header cells */
            .h-12, .h-\\[60px\\] {
              height: 35px !important;
              min-height: 35px !important;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f9fafb;
              font-weight: 600;
              border-bottom: 2px solid #e5e7eb;
              font-size: 10px;
            }
            
            /* Time cells specific styling */
            .border-r .h-12 {
              background: #f3f4f6;
            }
            
            /* Appointment positioning - CRITICAL FIX */
            .absolute {
              position: absolute !important;
              left: 2px !important;
              right: 2px !important;
              z-index: 10;
              border-radius: 3px;
              padding: 2px 4px;
              font-size: 8px;
              line-height: 1.2;
              background: #e3f2fd !important;
              border: 1px solid #1976d2 !important;
              color: #1565c0 !important;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            /* Different appointment colors */
            .bg-blue-50, [style*="background-color: rgb(239, 246, 255)"] {
              background: #e3f2fd !important;
              border-color: #1976d2 !important;
              color: #1565c0 !important;
            }
            
            .bg-green-50, [style*="background-color: rgb(240, 253, 244)"] {
              background: #e8f5e8 !important;
              border-color: #2e7d32 !important;
              color: #1b5e20 !important;
            }
            
            .bg-yellow-50, [style*="background-color: rgb(254, 252, 232)"] {
              background: #fff3e0 !important;
              border-color: #f57c00 !important;
              color: #e65100 !important;
            }
            
            .bg-red-50, [style*="background-color: rgb(254, 242, 242)"] {
              background: #ffebee !important;
              border-color: #d32f2f !important;
              color: #c62828 !important;
            }
            
            /* Table styles */
            .overflow-x-auto {
              overflow: visible !important;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 0;
              font-size: 9px;
              background: white;
            }
            
            th, td {
              border: 1px solid #e5e7eb;
              padding: 4px 3px;
              text-align: left;
              vertical-align: top;
              word-wrap: break-word;
              max-width: 100px;
            }
            
            th {
              background-color: #f9fafb;
              font-weight: 600;
              font-size: 8px;
              color: #374151;
            }
            
            /* Space utilities */
            .space-y-6 > * + * {
              margin-top: 15px;
            }
            
            .space-y-4 > * + * {
              margin-top: 10px;
            }
            
            /* Border utilities */
            .border {
              border: 1px solid #e5e7eb;
            }
            
            .border-r {
              border-right: 1px solid #e5e7eb;
            }
            
            .border-b {
              border-bottom: 1px solid #e5e7eb;
            }
            
            /* Padding utilities */
            .p-6, .pt-0 {
              padding: 8px;
            }
            
            .pt-1 {
              padding-top: 2px;
            }
            
            /* Text utilities */
            .text-xs {
              font-size: 8px;
            }
            
            .text-sm {
              font-size: 9px;
            }
            
            .text-2xl {
              font-size: 14px;
              font-weight: 600;
              color: #111827;
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
            
            .text-center {
              text-align: center;
            }
            
            /* Flex utilities */
            .flex {
              display: flex;
            }
            
            .items-center {
              align-items: center;
            }
            
            .justify-center {
              justify-content: center;
            }
            
            .items-start {
              align-items: flex-start;
            }
            
            /* Status badges */
            .inline-flex {
              display: inline-block;
              padding: 1px 4px;
              border-radius: 3px;
              font-size: 7px;
              background: #f3f4f6 !important;
              color: #374151 !important;
              border: 1px solid #d1d5db;
            }
            
            /* Hide interactive elements */
            button, [role="button"], .cursor-pointer, 
            [class*="hover:"], [class*="focus:"] {
              display: none !important;
            }
            
            /* Print specific */
            @media print {
              body { 
                margin: 0;
                padding: 8mm;
                font-size: 10px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .print-header {
                margin-bottom: 12px;
                padding-bottom: 8px;
              }
              
              .print-header h1 {
                font-size: 16px;
              }
              
              .grid > div > div {
                height: 35px !important;
              }
              
              .h-12, .h-\\[60px\\] {
                height: 30px !important;
                min-height: 30px !important;
              }
              
              .absolute {
                font-size: 7px;
                padding: 1px 3px;
              }
              
              table {
                font-size: 8px;
              }
              
              th, td {
                padding: 3px 2px;
              }
              
              .no-print { 
                display: none !important; 
              }
            }
            
            /* Page setup */
            @page {
              margin: 10mm;
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
