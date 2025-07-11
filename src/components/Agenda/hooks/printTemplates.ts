
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

const convertToLocalTime = (isoString: string): Date => {
  return new Date(isoString);
};

const getStatusColor = (appointment: Appointment): string => {
  if (appointment.appointment_statuses?.color) {
    return appointment.appointment_statuses.color;
  }
  
  // Fallback colors based on status
  const status = appointment.appointment_statuses?.label || 'Confirmado';
  switch (status) {
    case 'Confirmado': return '#10b981';
    case 'Cancelado': return '#ef4444';
    case 'Não Compareceu': return '#6b7280';
    case 'Em atendimento': return '#3b82f6';
    case 'Finalizado': return '#8b5cf6';
    default: return '#6b7280';
  }
};

export const generateCalendarPrintTemplate = (
  professionals: Professional[],
  appointments: Appointment[]
): string => {
  console.log('Generating calendar template with:', {
    professionalsCount: professionals?.length || 0,
    appointmentsCount: appointments?.length || 0
  });

  if (!professionals || professionals.length === 0) {
    return '<p>Nenhum profissional ativo encontrado.</p>';
  }

  if (!appointments || appointments.length === 0) {
    console.log('No appointments found for calendar');
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
        if (!apt.professional_id || apt.professional_id !== prof.id) {
          return false;
        }
        
        const aptDate = convertToLocalTime(apt.start_time);
        const aptHour = aptDate.getHours();
        return aptHour === hour;
      });

      console.log(`Hour ${hour}, Professional ${prof.name}: ${hourAppointments.length} appointments`);

      if (hourAppointments.length === 0) {
        return '<td class="time-cell empty"></td>';
      }

      // Create appointment content for this cell
      const appointmentContent = hourAppointments.map(apt => {
        const startDate = convertToLocalTime(apt.start_time);
        const startTime = startDate.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const patientName = apt.patients?.full_name || 'Paciente não informado';
        const procedureName = apt.procedures?.name || 'Sem procedimento';
        const statusLabel = apt.appointment_statuses?.label || 'Confirmado';
        const statusColor = getStatusColor(apt);

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
  console.log('Generating table template with:', appointments?.length || 0, 'appointments');

  if (!appointments || appointments.length === 0) {
    return '<p>Nenhum agendamento encontrado.</p>';
  }

  const tableRows = appointments.map(appointment => {
    const startDate = convertToLocalTime(appointment.start_time);
    const startTime = startDate.toLocaleString('pt-BR');
    const patientName = appointment.patients?.full_name || 'Paciente não informado';
    const professionalName = appointment.professionals?.name || 'Profissional não informado';
    const procedureName = appointment.procedures?.name || 'Sem procedimento';
    const statusLabel = appointment.appointment_statuses?.label || 'Confirmado';
    const statusColor = getStatusColor(appointment);
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
