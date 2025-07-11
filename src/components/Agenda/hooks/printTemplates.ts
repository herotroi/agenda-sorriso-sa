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

const getAppointmentDurationInHours = (startTime: string, endTime: string): number => {
  const start = convertToLocalTime(startTime);
  const end = convertToLocalTime(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

const shouldShowAppointmentInHour = (appointment: Appointment, hour: number): boolean => {
  const startTime = convertToLocalTime(appointment.start_time);
  const endTime = convertToLocalTime(appointment.end_time);
  
  const startHour = startTime.getHours();
  const startMinutes = startTime.getMinutes();
  const endHour = endTime.getHours();
  const endMinutes = endTime.getMinutes();
  
  // Verificar se o agendamento começa nesta hora
  if (startHour === hour) return true;
  
  // Verificar se o agendamento está em andamento nesta hora
  if (hour > startHour && hour < endHour) return true;
  
  // Verificar se o agendamento termina nesta hora (mas só se tiver mais de 0 minutos)
  if (hour === endHour && endMinutes > 0) return true;
  
  // Caso especial: agendamento que começa em uma hora e termina na mesma hora
  if (startHour === endHour && hour === startHour) return true;
  
  return false;
};

const getAppointmentDisplayType = (appointment: Appointment, hour: number): 'start' | 'continuation' | 'end' => {
  const startTime = convertToLocalTime(appointment.start_time);
  const endTime = convertToLocalTime(appointment.end_time);
  
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const endMinutes = endTime.getMinutes();
  
  // Se começar nesta hora
  if (startHour === hour) {
    // Se também terminar na mesma hora, é apenas 'start'
    if (endHour === hour) return 'start';
    // Se continuar para outras horas, é 'start'
    return 'start';
  }
  
  // Se terminar nesta hora (com minutos > 0)
  if (endHour === hour && endMinutes > 0) return 'end';
  
  // Caso contrário, é continuação
  return 'continuation';
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
        
        return shouldShowAppointmentInHour(apt, hour);
      });

      console.log(`Hour ${hour}, Professional ${prof.name}: ${hourAppointments.length} appointments`);

      if (hourAppointments.length === 0) {
        return '<td class="time-cell empty"></td>';
      }

      // Create appointment content for this cell
      const appointmentContent = hourAppointments.map(apt => {
        const displayType = getAppointmentDisplayType(apt, hour);
        const startDate = convertToLocalTime(apt.start_time);
        const endDate = convertToLocalTime(apt.end_time);
        const duration = getAppointmentDurationInHours(apt.start_time, apt.end_time);
        
        const startTime = startDate.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const endTime = endDate.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const patientName = apt.patients?.full_name || 'Paciente não informado';
        const procedureName = apt.procedures?.name || 'Sem procedimento';
        const statusLabel = apt.appointment_statuses?.label || 'Confirmado';
        const statusColor = getStatusColor(apt);

        // Different content based on display type
        if (displayType === 'start') {
          return `
            <div class="appointment-block appointment-start" style="border-left-color: ${statusColor};">
              <div class="patient-name">${patientName}</div>
              <div class="procedure-name">${procedureName}</div>
              <div class="appointment-time">${startTime} - ${endTime}</div>
              <div class="status-badge" style="background-color: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                ${statusLabel}
              </div>
              ${duration > 1 ? `<div class="duration-indicator">Duração: ${duration.toFixed(1)}h</div>` : ''}
            </div>
          `;
        } else if (displayType === 'continuation') {
          return `
            <div class="appointment-block appointment-continuation" style="border-left-color: ${statusColor};">
              <div class="patient-name continuation-text">${patientName} (continuação)</div>
              <div class="procedure-name">${procedureName}</div>
              <div class="continuation-indicator">↕ Em andamento</div>
            </div>
          `;
        } else { // end
          return `
            <div class="appointment-block appointment-end" style="border-left-color: ${statusColor};">
              <div class="patient-name">${patientName} (final)</div>
              <div class="procedure-name">${procedureName}</div>
              <div class="appointment-time">Termina às ${endTime}</div>
            </div>
          `;
        }
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
