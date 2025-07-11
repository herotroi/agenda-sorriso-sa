
import { generateHours, formatTime, getCurrentDate } from './printUtils';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  price: number | null;
  professional_id: string | null;
  patients: { full_name: string } | null;
  professionals: { name: string } | null;
  procedures: { name: string } | null;
  appointment_statuses: { label: string; color: string } | null;
}

interface Professional {
  id: string;
  name: string;
  active: boolean;
}

export const generateCalendarPrintTemplate = (
  professionals: Professional[],
  appointments: Appointment[]
): string => {
  if (!professionals || professionals.length === 0) {
    return '<p>Nenhum profissional ativo encontrado.</p>';
  }

  const hours = generateHours();
  const currentDate = getCurrentDate();
  
  // Create header row with professional names
  const headerCells = professionals.map(prof => 
    `<th class="professional-header">${prof.name}</th>`
  ).join('');

  // Create time rows
  const timeRows = hours.map(hour => {
    const hourStr = formatTime(hour);
    
    // Get appointments for this hour for each professional
    const professionalCells = professionals.map(prof => {
      const hourAppointments = appointments.filter(apt => {
        const aptHour = new Date(apt.start_time).getHours();
        return aptHour === hour && apt.professional_id === prof.id;
      });

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
  
  return `
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
};

export const generateTablePrintTemplate = (appointments: Appointment[]): string => {
  if (!appointments || appointments.length === 0) {
    return '<p>Nenhum agendamento encontrado.</p>';
  }

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
  
  return `
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
};
