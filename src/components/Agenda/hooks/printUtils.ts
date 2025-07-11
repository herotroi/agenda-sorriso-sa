
export const getCurrentDate = () => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getTodayDateRange = () => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

export const generateHours = () => {
  return Array.from({ length: 24 }, (_, i) => i);
};

export const formatTime = (hour: number) => {
  return hour.toString().padStart(2, '0') + ':00';
};

export const openPrintWindow = (content: string, currentDate: string, activeTab: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desabilitado.');
    return null;
  }

  const printStyles = `
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

          /* Calendar Grid Styles */
          .calendar-print-container {
            width: 100%;
          }

          .calendar-header {
            margin-bottom: 15px;
            text-align: left;
          }

          .calendar-header h2 {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 5px;
          }

          .date-info {
            font-size: 10px;
            color: #6b7280;
          }

          .calendar-grid-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            border: 1px solid #e5e7eb;
          }

          .hour-header, .professional-header {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 6px 4px;
            text-align: center;
            font-weight: 600;
            font-size: 9px;
            color: #374151;
          }

          .hour-cell {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 6px 4px;
            text-align: center;
            font-weight: 500;
            font-size: 9px;
            color: #6b7280;
            width: 50px;
            vertical-align: top;
          }

          .time-cell {
            border: 1px solid #e5e7eb;
            padding: 4px;
            vertical-align: top;
            min-height: 40px;
            position: relative;
          }

          .time-cell.empty {
            background-color: #fafafa;
          }

          .time-cell.with-appointment {
            background-color: white;
          }

          .appointment-block {
            margin-bottom: 8px;
            padding: 4px;
            background-color: #f8fafc;
            border-left: 3px solid #3b82f6;
            border-radius: 2px;
          }

          .patient-name {
            font-weight: 600;
            font-size: 8px;
            color: #1f2937;
            margin-bottom: 2px;
            line-height: 1.2;
          }

          .procedure-name {
            font-size: 7px;
            color: #4b5563;
            margin-bottom: 2px;
            line-height: 1.2;
          }

          .appointment-time {
            font-size: 7px;
            color: #6b7280;
            margin-bottom: 3px;
            font-weight: 500;
          }

          .status-badge {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 8px;
            font-size: 6px;
            font-weight: 500;
            text-align: center;
            line-height: 1.2;
          }

          /* Existing table styles */
          .rounded-lg {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: white;
            overflow: visible;
          }
          
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
          
          .inline-flex {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 8px;
            font-weight: 500;
            white-space: nowrap;
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
              font-size: 9px;
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

            .calendar-grid-table {
              font-size: 8px;
            }

            .hour-header, .professional-header {
              font-size: 8px;
              padding: 4px 3px;
            }

            .hour-cell {
              font-size: 8px;
              padding: 4px 3px;
            }

            .patient-name {
              font-size: 7px;
            }

            .procedure-name {
              font-size: 6px;
            }

            .appointment-time {
              font-size: 6px;
            }

            .status-badge {
              font-size: 5px;
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
            size: A4 landscape;
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
          ${content}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(printStyles);
  printWindow.document.close();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 1000);

  return printWindow;
};
