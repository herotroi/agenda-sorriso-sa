
import { Appointment } from './types';
import { convertToLocalTime, getStatusColor } from './appointmentUtils';

export const generateTablePrintTemplate = (
  appointments: Appointment[], 
  professionals?: any[], 
  customTitle?: string
): string => {
  console.log('Generating table template with:', appointments?.length || 0, 'appointments');

  if (!appointments || appointments.length === 0) {
    return '<p>Nenhum agendamento encontrado.</p>';
  }

  const tableTitle = customTitle || 'Tabela de Agendamentos';

  // Gerar informações de pausas e férias por profissional
  let timeBlocksInfo = '';
  if (professionals && professionals.length > 0) {
    const timeBlocksData = professionals.map(prof => {
      let profInfo = `<h4 style="margin-bottom: 8px; color: #374151; font-weight: 600;">${prof.name}</h4>`;
      let hasTimeBlocks = false;
      
      // Férias - verificar se estão ativas e exibir as datas originais
      if (prof.vacation_active && prof.vacation_start && prof.vacation_end) {
        const startDate = new Date(prof.vacation_start).toLocaleDateString('pt-BR');
        const endDate = new Date(prof.vacation_end).toLocaleDateString('pt-BR');
        profInfo += `<p style="margin: 4px 0; color: #4b5563;">🏖️ <strong>Férias:</strong> ${startDate} até ${endDate}</p>`;
        hasTimeBlocks = true;
      }
      
      // Pausas - verificar se existem e são válidas
      if (prof.break_times) {
        let breakTimes = [];
        try {
          // Garantir que break_times seja um array
          if (Array.isArray(prof.break_times)) {
            breakTimes = prof.break_times;
          } else if (typeof prof.break_times === 'string') {
            breakTimes = JSON.parse(prof.break_times);
          }
        } catch (e) {
          console.warn('Failed to parse break_times:', e);
        }
        
        if (breakTimes.length > 0) {
          const validBreaks = breakTimes.filter(bt => bt && bt.start && bt.end);
          if (validBreaks.length > 0) {
            const breaks = validBreaks.map(bt => `${bt.start} - ${bt.end}`).join(', ');
            profInfo += `<p style="margin: 4px 0; color: #4b5563;">☕ <strong>Pausas:</strong> ${breaks}</p>`;
            hasTimeBlocks = true;
          }
        }
      }
      
      // Só retornar informações se houver pausas ou férias
      return hasTimeBlocks ? profInfo : '';
    }).filter(info => info.trim() !== '').join('<div style="margin-bottom: 16px;"></div>');

    if (timeBlocksData.trim()) {
      timeBlocksInfo = `
        <div class="time-blocks-section" style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h3 style="margin-bottom: 16px; color: #374151; font-weight: 600; font-size: 16px;">Pausas e Férias dos Profissionais</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${timeBlocksData}
          </div>
        </div>
      `;
    }
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
        <td style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">${patientName}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">${professionalName}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">${procedureName}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">${startTime}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">
          <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; background-color: ${statusColor}20; color: ${statusColor};">
            ${statusLabel}
          </span>
        </td>
        <td style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">${displayNotes}</td>
      </tr>
    `;
  }).join('');
  
  return `
    <div style="border-radius: 8px; border: 1px solid #e5e7eb; padding: 24px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #111827;">${tableTitle}</h2>
        <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">Total de agendamentos: ${appointments.length}</p>
      </div>
      
      ${timeBlocksInfo}
      
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr>
              <th style="border: 1px solid #d1d5db; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Paciente</th>
              <th style="border: 1px solid #d1d5db; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Profissional</th>
              <th style="border: 1px solid #d1d5db; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Procedimento</th>
              <th style="border: 1px solid #d1d5db; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Data/Hora</th>
              <th style="border: 1px solid #d1d5db; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Status</th>
              <th style="border: 1px solid #d1d5db; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Observações</th>
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
