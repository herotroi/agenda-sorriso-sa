
import { generateHours, formatTime, getCurrentDate } from '../printUtils';
import { Appointment, Professional } from './types';
import { 
  shouldShowAppointmentInHour, 
  getAppointmentDisplayType, 
  convertToLocalTime,
  getStatusColor,
  getAppointmentDurationInHours 
} from './appointmentUtils';

// Função para gerar blocos de pausa e férias
const generateTimeBlocks = (professionals: Professional[], selectedDate: Date) => {
  const blocks: Array<{
    id: string;
    type: 'break' | 'vacation';
    professional_id: string;
    start_time: string;
    end_time: string;
    title: string;
  }> = [];

  professionals.forEach(prof => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Verificar férias
    if (prof.vacation_active && prof.vacation_start && prof.vacation_end) {
      const vacationStart = new Date(prof.vacation_start);
      const vacationEnd = new Date(prof.vacation_end);
      
      if (selectedDate >= vacationStart && selectedDate <= vacationEnd) {
        blocks.push({
          id: `vacation-${prof.id}-${dateStr}`,
          type: 'vacation',
          professional_id: prof.id,
          start_time: `${dateStr}T00:00:00`,
          end_time: `${dateStr}T23:59:59`,
          title: 'Férias'
        });
      }
    }

    // Verificar pausas
    if (prof.break_times && Array.isArray(prof.break_times)) {
      prof.break_times.forEach((breakTime: { start: string; end: string }, index: number) => {
        blocks.push({
          id: `break-${prof.id}-${index}-${dateStr}`,
          type: 'break',
          professional_id: prof.id,
          start_time: `${dateStr}T${breakTime.start}:00`,
          end_time: `${dateStr}T${breakTime.end}:00`,
          title: `Pausa ${breakTime.start} - ${breakTime.end}`
        });
      });
    }
  });

  return blocks;
};

const shouldShowTimeBlockInHour = (block: any, hour: number): boolean => {
  const startTime = new Date(block.start_time);
  const endTime = new Date(block.end_time);
  
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  
  return hour >= startHour && hour < endHour;
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
  const selectedDate = new Date(); // Para o contexto de impressão, usar data atual
  
  // Gerar blocos de tempo (pausas e férias)
  const timeBlocks = generateTimeBlocks(professionals, selectedDate);
  
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

      // Get time blocks for this hour for this professional
      const hourTimeBlocks = timeBlocks.filter(block => 
        block.professional_id === prof.id && shouldShowTimeBlockInHour(block, hour)
      );

      console.log(`Hour ${hour}, Professional ${prof.name}: ${hourAppointments.length} appointments, ${hourTimeBlocks.length} time blocks`);

      // Combine appointments and time blocks content
      let cellContent = '';

      // Add time blocks first
      if (hourTimeBlocks.length > 0) {
        const timeBlockContent = hourTimeBlocks.map(block => {
          const bgColor = block.type === 'vacation' ? '#fef3c7' : '#e5e7eb'; // Yellow for vacation, gray for break
          const textColor = block.type === 'vacation' ? '#92400e' : '#374151';
          const borderColor = block.type === 'vacation' ? '#f59e0b' : '#6b7280';
          
          return `
            <div class="time-block ${block.type}" style="background-color: ${bgColor}; color: ${textColor}; border-left: 4px solid ${borderColor}; padding: 4px 8px; margin-bottom: 2px; border-radius: 4px; font-size: 12px;">
              <div class="block-title" style="font-weight: 600;">${block.title}</div>
              ${block.type === 'vacation' ? '<div class="block-icon">🏖️</div>' : '<div class="block-icon">☕</div>'}
            </div>
          `;
        }).join('');
        cellContent += timeBlockContent;
      }

      // Add appointments
      if (hourAppointments.length > 0) {
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
        cellContent += appointmentContent;
      }

      if (cellContent === '') {
        return '<td class="time-cell empty"></td>';
      }

      return `<td class="time-cell with-content">${cellContent}</td>`;
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
