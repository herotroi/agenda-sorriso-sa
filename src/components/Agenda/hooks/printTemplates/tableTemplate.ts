
import { Appointment } from './types';
import { convertToLocalTime, getStatusColor } from './appointmentUtils';

export const generateTablePrintTemplate = (
  appointments: Appointment[], 
  professionals?: any[], 
  customTitle?: string
): string => {
  console.log('Generating table template with:', appointments?.length || 0, 'appointments');

  const tableTitle = customTitle || 'Tabela de Agendamentos';

  // Usar apenas os agendamentos recebidos (já filtrados sem pausas/férias)
  const allTableItems: any[] = [...(appointments || [])];

  // Ordenar todos os itens por data/hora
  allTableItems.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  if (allTableItems.length === 0) {
    return '<p>Nenhum agendamento encontrado.</p>';
  }

  const tableRows = allTableItems.map(item => {
    const startDate = convertToLocalTime(item.start_time);
    const startTime = startDate.toLocaleString('pt-BR');
    
    const patientName = item.patients?.full_name || 'Paciente não informado';
    const professionalName = item.professionals?.name || 'Profissional não informado';
    const procedureName = item.procedures?.name || 'Sem procedimento';
    const statusLabel = item.appointment_statuses?.label || 'Confirmado';
    const statusColor = getStatusColor(item);
    const notes = item.notes || 'Sem observações';
    const displayNotes = notes.length > 30 ? notes.substring(0, 30) + '...' : notes;
    
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${patientName}</td>
        <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${professionalName}</td>
        <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${procedureName}</td>
        <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${startTime}</td>
        <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">
          <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; background-color: ${statusColor}20; color: ${statusColor};">
            ${statusLabel}
          </span>
        </td>
        <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${displayNotes}</td>
      </tr>
    `;
  }).join('');
  
  return `
    <div style="border-radius: 8px; border: 1px solid #e5e7eb; padding: 24px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #111827;">${tableTitle}</h2>
        <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">Total de agendamentos: ${allTableItems.length}</p>
      </div>
      
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; border: 1px solid #000;">
          <thead>
            <tr>
              <th style="border: 1px solid #000 !important; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Paciente</th>
              <th style="border: 1px solid #000 !important; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Profissional</th>
              <th style="border: 1px solid #000 !important; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Procedimento</th>
              <th style="border: 1px solid #000 !important; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Data/Hora</th>
              <th style="border: 1px solid #000 !important; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Status</th>
              <th style="border: 1px solid #000 !important; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Observações</th>
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
