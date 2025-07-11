
import { generateHours, formatTime, getCurrentDate } from '../printUtils';
import { Appointment, Professional } from './types';
import { 
  shouldShowAppointmentInHour, 
  getAppointmentDisplayType, 
  convertToLocalTime,
  getStatusColor,
  getAppointmentDurationInHours 
} from './appointmentUtils';

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
