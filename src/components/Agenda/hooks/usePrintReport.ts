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
      // For calendar view, fetch data to create the calendar-style print layout
      console.log('Fetching appointments and professionals for calendar print...');
      
      try {
        // Get today's date for filtering
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch professionals
        const { data: professionals, error: profError } = await supabase
          .from('professionals')
          .select('*')
          .eq('active', true)
          .order('name');

        if (profError) throw profError;

        // Fetch appointments for today
        const { data: appointments, error: aptError } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            end_time,
            notes,
            price,
            professional_id,
            patients(full_name),
            professionals(name),
            procedures(name),
            appointment_statuses(label, color)
          `)
          .gte('start_time', startOfDay.toISOString())
          .lte('start_time', endOfDay.toISOString())
          .order('start_time', { ascending: true });

        if (aptError) throw aptError;

        console.log('Data fetched - Professionals:', professionals?.length, 'Appointments:', appointments?.length);

        if (!professionals || professionals.length === 0) {
          contentToPrint = '<p>Nenhum profissional ativo encontrado.</p>';
        } else {
          // Generate all 24 hours
          const hours = Array.from({ length: 24 }, (_, i) => i);
          
          // Create header row with professional names
          const headerCells = professionals.map(prof => 
            `<th class="professional-header">${prof.name}</th>`
          ).join('');

          // Create time rows
          const timeRows = hours.map(hour => {
            const hourStr = hour.toString().padStart(2, '0') + ':00';
            
            // Get appointments for this hour for each professional
            const professionalCells = professionals.map(prof => {
              const hourAppointments = appointments?.filter(apt => {
                const aptHour = new Date(apt.start_time).getHours();
                return aptHour === hour && apt.professional_id === prof.id;
              }) || [];

              if (hourAppointments.length === 0) {
                return '<td class="time-cell empty"></td>';
              }

              // Create appointment content for this cell
              const appointmentContent = hourAppointments.map(apt => {
                const startTime = new Date(apt.start_time).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                const patientName = apt.patients?.full_name || 'N/A';
                const procedureName = apt.procedures?.name || 'Sem procedimento';
                const statusLabel = apt.appointment_statuses?.label || 'N/A';
                const statusColor = apt.appointment_statuses?.color || '#6b7280';

                return `
                  <div class="appointment-block">
                    <div class="patient-name">${patientName}</div>
                    <div class="procedure-name">${procedureName}</div>
                    <div class="appointment-time">${startTime}</div>
                    <div class="status-badge" style="background-color: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                      ${statusLabel}
                    </div>
                  </div>
                `;
              }).join('');

              return `<td class="time-cell with-appointment">${appointmentContent}</td>`;
            }).join('');

            return `
              <tr>
                <td class="hour-cell">${hourStr}</td>
                ${professionalCells}
              </tr>
            `;
          }).join('');
          
          contentToPrint = `
            <div class="calendar-print-container">
              <div class="calendar-header">
                <h2>Calendário de Agendamentos</h2>
                <p class="date-info">${currentDate}</p>
              </div>
              <table class="calendar-grid-table">
                <thead>
                  <tr>
                    <th class="hour-header">Hora</th>
                    ${headerCells}
                  </tr>
                </thead>
                <tbody>
                  ${timeRows}
                </tbody>
              </table>
            </div>
          `;
        }
      } catch (error) {
        console.error('Error in calendar print function:', error);
        contentToPrint = '<p>Erro ao preparar dados do calendário para impressão.</p>';
      }
    } else {
      // For table view, fetch fresh data from database
      console.log('Fetching appointments for table print...');
      
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

    // Enhanced CSS for calendar grid layout
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
