
import { supabase } from '@/integrations/supabase/client';

export function usePrintReport() {
  const handlePrint = async (activeTab: string) => {
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
      // For table view, fetch fresh data from database
      console.log('Fetching appointments for print...');
      
      try {
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            end_time,
            notes,
            price,
            patients(full_name),
            professionals(name),
            procedures(name),
            appointment_statuses(label, color)
          `)
          .order('start_time', { ascending: true });

        if (error) {
          console.error('Error fetching appointments:', error);
          contentToPrint = '<p>Erro ao carregar agendamentos para impressão.</p>';
        } else if (!appointments || appointments.length === 0) {
          contentToPrint = '<p>Nenhum agendamento encontrado.</p>';
        } else {
          console.log('Appointments fetched for print:', appointments);
          
          // Build table HTML with the fetched data
          const tableRows = appointments.map(appointment => {
            const startTime = new Date(appointment.start_time).toLocaleString('pt-BR');
            const patientName = appointment.patients?.full_name || 'N/A';
            const professionalName = appointment.professionals?.name || 'N/A';
            const procedureName = appointment.procedures?.name || 'Nenhum';
            const statusLabel = appointment.appointment_statuses?.label || 'N/A';
            const statusColor = appointment.appointment_statuses?.color || '#6b7280';
            const notes = appointment.notes || 'Sem observações';
            const displayNotes = notes.length > 30 ? notes.substring(0, 30) + '...' : notes;
            
            return `
              <tr>
                <td>${patientName}</td>
                <td>${professionalName}</td>
                <td>${procedureName}</td>
                <td>${startTime}</td>
                <td>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                        style="background-color: ${statusColor}20; color: ${statusColor}">
                    ${statusLabel}
                  </span>
                </td>
                <td>${displayNotes}</td>
              </tr>
            `;
          }).join('');
          
          contentToPrint = `
            <div class="rounded-lg border p-6">
              <div class="mb-4">
                <h2 class="text-2xl font-semibold">Tabela de Agendamentos</h2>
                <p class="text-sm text-gray-600 mt-2">Total de agendamentos: ${appointments.length}</p>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                  <thead>
                    <tr>
                      <th class="border border-gray-300 px-4 py-2 bg-gray-50 text-left font-medium">Paciente</th>
                      <th class="border border-gray-300 px-4 py-2 bg-gray-50 text-left font-medium">Profissional</th>
                      <th class="border border-gray-300 px-4 py-2 bg-gray-50 text-left font-medium">Procedimento</th>
                      <th class="border border-gray-300 px-4 py-2 bg-gray-50 text-left font-medium">Data/Hora</th>
                      <th class="border border-gray-300 px-4 py-2 bg-gray-50 text-left font-medium">Status</th>
                      <th class="border border-gray-300 px-4 py-2 bg-gray-50 text-left font-medium">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        }
      } catch (error) {
        console.error('Error in print function:', error);
        contentToPrint = '<p>Erro ao preparar dados para impressão.</p>';
      }
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desabilitado.');
      return;
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
            
            /* Table styles - Enhanced for better visibility */
            .overflow-x-auto {
              overflow: visible !important;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 0;
              font-size: 10px;
              background: white;
              border: 1px solid #e5e7eb;
            }
            
            th, td {
              border: 1px solid #e5e7eb;
              padding: 8px 6px;
              text-align: left;
              vertical-align: top;
              word-wrap: break-word;
            }
            
            th {
              background-color: #f9fafb;
              font-weight: 600;
              font-size: 10px;
              color: #374151;
            }
            
            tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            /* Status badges in table */
            .inline-flex {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 12px;
              font-size: 8px;
              font-weight: 500;
              white-space: nowrap;
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
            
            /* Padding utilities */
            .p-6 {
              padding: 12px;
            }
            
            /* Text utilities */
            .text-2xl {
              font-size: 16px;
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
            
            .text-sm {
              font-size: 9px;
            }
            
            .mt-2 {
              margin-top: 8px;
            }
            
            .mb-4 {
              margin-bottom: 16px;
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
              
              table {
                font-size: 9px;
              }
              
              th, td {
                padding: 4px 3px;
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
    }, 1000);
  };

  return { handlePrint };
}
