export function usePrintReport() {
  const handlePrint = (activeTab: string) => {
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
      // For table view, get the table content more specifically
      const activeTabPanel = document.querySelector('[role="tabpanel"][data-state="active"]');
      
      if (activeTabPanel) {
        console.log('Active tab panel found:', activeTabPanel);
        
        // Look for the card containing the table
        const tableCard = activeTabPanel.querySelector('[data-testid="appointments-table"], .rounded-lg.border');
        
        if (tableCard) {
          console.log('Table card found:', tableCard);
          
          // Clone the card content to modify it for printing
          const contentClone = tableCard.cloneNode(true) as HTMLElement;
          
          // Remove action buttons and interactive elements but keep the table structure
          const buttons = contentClone.querySelectorAll('button');
          buttons.forEach(button => {
            // If it's in the header actions area, remove completely
            if (button.closest('.flex.gap-2')) {
              button.remove();
            } else {
              // If it's in table cells, replace with a dash
              button.replaceWith(document.createTextNode('-'));
            }
          });
          
          // Remove the header buttons container if it exists
          const headerActions = contentClone.querySelector('.flex.gap-2');
          if (headerActions) {
            headerActions.remove();
          }
          
          contentToPrint = contentClone.innerHTML;
          console.log('Content to print:', contentToPrint);
        } else {
          console.log('Table card not found, trying alternative selectors');
          
          // Alternative: look for table directly
          const table = activeTabPanel.querySelector('table');
          if (table) {
            console.log('Found table directly:', table);
            const tableClone = table.cloneNode(true) as HTMLElement;
            
            // Remove action buttons from table
            const actionButtons = tableClone.querySelectorAll('button');
            actionButtons.forEach(button => {
              button.replaceWith(document.createTextNode('-'));
            });
            
            // Wrap table in a card-like structure for better printing
            contentToPrint = `
              <div class="rounded-lg border p-6">
                <div class="mb-4">
                  <h2 class="text-2xl font-semibold">Tabela de Agendamentos</h2>
                </div>
                ${tableClone.outerHTML}
              </div>
            `;
          } else {
            console.log('No table found');
            contentToPrint = '<p>Nenhum agendamento encontrado na tabela.</p>';
          }
        }
      } else {
        console.log('No active tab panel found');
        contentToPrint = '<p>Nenhum conteúdo encontrado para impressão.</p>';
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
              padding: 6px 4px;
              text-align: left;
              vertical-align: top;
              word-wrap: break-word;
            }
            
            th {
              background-color: #f9fafb;
              font-weight: 600;
              font-size: 9px;
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
    }, 1500);
  };

  return { handlePrint };
}
