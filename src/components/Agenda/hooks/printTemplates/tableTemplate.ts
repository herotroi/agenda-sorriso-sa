
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
      let profInfo = `<h4>${prof.name}</h4>`;
      
      // Férias - ajustar datas para começar e terminar um dia antes
      if (prof.vacation_active && prof.vacation_start && prof.vacation_end) {
        const originalStart = new Date(prof.vacation_start);
        const originalEnd = new Date(prof.vacation_end);
        
        originalStart.setDate(originalStart.getDate() - 1);
        originalEnd.setDate(originalEnd.getDate() - 1);
        
        const startDate = originalStart.toLocaleDateString('pt-BR');
        const endDate = originalEnd.toLocaleDateString('pt-BR');
        profInfo += `<p>🏖️ <strong>Férias:</strong> ${startDate} até ${endDate}</p>`;
      }
      
      // Pausas
      if (prof.break_times && Array.isArray(prof.break_times) && prof.break_times.length > 0) {
        const breaks = prof.break_times.map((bt: any) => `${bt.start} - ${bt.end}`).join(', ');
        profInfo += `<p>☕ <strong>Pausas:</strong> ${breaks}</p>`;
      }
      
      return profInfo;
    }).join('');

    if (timeBlocksData.trim()) {
      timeBlocksInfo = `
        <div class="time-blocks-section" style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
          <h3 style="margin-bottom: 16px; color: #374151;">Pausas e Férias dos Profissionais</h3>
          ${timeBlocksData}
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
        <h2 class="text-2xl font-semibold">${tableTitle}</h2>
        <p class="text-sm text-gray-600 mt-2">Total de agendamentos: ${appointments.length}</p>
      </div>
      
      ${timeBlocksInfo}
      
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
