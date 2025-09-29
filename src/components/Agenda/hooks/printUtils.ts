
export const getCurrentDate = (): string => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getFormattedDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
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

export const generateHours = (): number[] => {
  return Array.from({ length: 24 }, (_, i) => i);
};

export const formatTime = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

export const openPrintWindow = (
  content: string, 
  displayDate: string, 
  activeTab: string, 
  selectedDate?: Date,
  professionalId?: string
) => {
  const reportType = activeTab === 'calendar' ? 'Calendário' : 'Tabela de Agendamentos';
  const professionalFilter = professionalId ? ' - Profissional Individual' : '';
  const title = `${reportType}${professionalFilter} - ${displayDate}`;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  const printHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.4;
          color: #1f2937;
          margin: 0;
          padding: 20px;
          background: white;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        
        .print-header h1 {
          margin: 0 0 5px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .print-header .date-info {
          font-size: 14px;
          color: #6b7280;
          margin: 2px 0;
        }
        
        .print-header .report-type {
          font-size: 12px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }
        
        /* Calendar specific styles */
        .calendar-print-container {
          width: 100%;
        }
        
        .calendar-header {
          margin-bottom: 20px;
        }
        
        .calendar-header h2 {
          margin: 0 0 5px 0;
          font-size: 20px;
          color: #1f2937;
        }
        
        .calendar-grid-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        
        .calendar-grid-table th,
        .calendar-grid-table td {
          border: 1px solid #d1d5db;
          text-align: left;
          vertical-align: top;
        }
        
        .hour-header,
        .professional-header {
          background-color: #f9fafb;
          font-weight: 600;
          padding: 8px;
          text-align: center;
        }
        
        .hour-cell {
          background-color: #f9fafb;
          font-weight: 500;
          padding: 8px;
          text-align: center;
          width: 80px;
          font-size: 11px;
        }
        
        .time-cell {
          padding: 4px;
          min-height: 40px;
          width: auto;
        }
        
        .time-cell.empty {
          background-color: #fafafa;
        }
        
        .appointment-block {
          margin: 2px 0;
          padding: 6px;
          border-radius: 4px;
          border-left: 4px solid #6b7280;
          background-color: #f8fafc;
          font-size: 10px;
          line-height: 1.3;
        }
        
        .appointment-start {
          background-color: #eff6ff;
        }
        
        .appointment-continuation {
          background-color: #f0f9ff;
          opacity: 0.8;
        }
        
        .appointment-end {
          background-color: #ecfdf5;
        }
        
        .patient-name {
          font-weight: 600;
          margin-bottom: 2px;
          color: #1f2937;
        }
        
        .procedure-name {
          color: #4b5563;
          margin-bottom: 2px;
        }
        
        .appointment-time {
          color: #6b7280;
          font-size: 9px;
          margin-bottom: 3px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 500;
        }
        
        .duration-indicator {
          color: #9ca3af;
          font-size: 9px;
          font-style: italic;
          margin-top: 2px;
        }
        
        .continuation-text {
          font-style: italic;
        }
        
        .continuation-indicator {
          color: #6b7280;
          font-size: 9px;
          text-align: center;
          margin: 2px 0;
        }
        
        /* Table specific styles */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        table th,
        table td {
          border: 1px solid #d1d5db;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        
        table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        
        table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .error-message {
          text-align: center;
          color: #dc2626;
          padding: 40px;
          border: 2px dashed #fca5a5;
          border-radius: 8px;
          background-color: #fef2f2;
        }
        
        .error-message h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
        }
        
        .rounded-lg {
          border-radius: 8px;
        }
        
        .border {
          border: 1px solid #e5e7eb;
        }
        
        .p-6 {
          padding: 24px;
        }
        
        .mb-4 {
          margin-bottom: 16px;
        }
        
        .text-2xl {
          font-size: 24px;
        }
        
        .font-semibold {
          font-weight: 600;
        }
        
        .text-sm {
          font-size: 14px;
        }
        
        .text-gray-600 {
          color: #6b7280;
        }
        
        .mt-2 {
          margin-top: 8px;
        }
        
        .overflow-x-auto {
          overflow-x: auto;
        }
        
        .inline-flex {
          display: inline-flex;
        }
        
        .items-center {
          align-items: center;
        }
        
        .px-2 {
          padding-left: 8px;
          padding-right: 8px;
        }
        
        .py-1 {
          padding-top: 4px;
          padding-bottom: 4px;
        }
        
        .rounded-full {
          border-radius: 50px;
        }
        
        .text-xs {
          font-size: 12px;
        }
        
        .font-medium {
          font-weight: 500;
        }
        
        /* Print optimization */
        @media print {
          .print-header {
            page-break-after: avoid;
          }
          
          .appointment-block {
            page-break-inside: avoid;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>Relatório de Agendamentos</h1>
        <div class="date-info">${displayDate}</div>
        <div class="report-type">${reportType}${professionalFilter}</div>
      </div>
      
      ${content}
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printHTML);
  printWindow.document.close();
};
