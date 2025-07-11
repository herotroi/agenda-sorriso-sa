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
            border-bottom: 3px solid #333;
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

          /* Calendar Grid Styles - Improved based on the image model */
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
            border: 2px solid #000;
          }

          .hour-header, .professional-header {
            background-color: #f3f4f6;
            border: 2px solid #000;
            padding: 8px 4px;
            text-align: center;
            font-weight: 700;
            font-size: 10px;
            color: #111827;
            vertical-align: middle;
          }

          .hour-cell {
            background-color: #f9fafb;
            border: 1px solid #000;
            border-right: 2px solid #000;
            padding: 8px 4px;
            text-align: center;
            font-weight: 600;
            font-size: 9px;
            color: #374151;
            width: 60px;
            vertical-align: top;
            min-height: 45px;
          }

          .time-cell {
            border: 1px solid #666;
            border-bottom: 1px solid #000;
            padding: 3px;
            vertical-align: top;
            min-height: 45px;
            position: relative;
          }

          .time-cell.empty {
            background-color: #fefefe;
          }

          .time-cell.with-appointment {
            background-color: white;
          }

          .appointment-block {
            margin-bottom: 6px;
            padding: 4px;
            background-color: #f8fafc;
            border-left: 4px solid #3b82f6;
            border-radius: 3px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }

          .appointment-start {
            background-color: #f0f9ff;
          }

          .appointment-continuation {
            background-color: #f0fdf4;
            border-left-style: dashed;
            opacity: 0.8;
          }

          .appointment-end {
            background-color: #fef7f0;
          }

          .patient-name {
            font-weight: 700;
            font-size: 8px;
            color: #1f2937;
            margin-bottom: 2px;
            line-height: 1.2;
          }

          .continuation-text {
            font-style: italic;
            color: #059669;
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
            font-weight: 600;
          }

          .status-badge {
            display: inline-block;
            padding: 2px 4px;
            border-radius: 8px;
            font-size: 6px;
            font-weight: 600;
            text-align: center;
            line-height: 1.2;
          }

          .duration-indicator {
            font-size: 6px;
            color: #7c3aed;
            font-weight: 600;
            margin-top: 2px;
          }

          .continuation-indicator {
            font-size: 7px;
            color: #059669;
            font-weight: 600;
            text-align: center;
            margin-top: 2px;
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
              border-bottom: 2px solid #000;
            }
            
            .print-header h1 {
              font-size: 16px;
            }

            .calendar-grid-table {
              font-size: 8px;
              border: 2px solid #000;
            }

            .hour-header, .professional-header {
              font-size: 8px;
              padding: 6px 3px;
              border: 2px solid #000;
            }

            .hour-cell {
              font-size: 8px;
              padding: 6px 3px;
              border-right: 2px solid #000;
            }

            .time-cell {
              border-bottom: 1px solid #000;
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
