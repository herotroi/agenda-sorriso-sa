
import { Appointment } from './types';
import { convertToLocalTime, getStatusColor } from './appointmentUtils';

export const generateTablePrintTemplate = (
  appointments: Appointment[], 
  professionals?: any[], 
  customTitle?: string
): string => {
  console.log('Generating table template with:', appointments?.length || 0, 'appointments');

  const tableTitle = customTitle || 'Tabela de Agendamentos';

  // Criar array combinado de agendamentos + férias + pausas
  const allTableItems: any[] = [...(appointments || [])];

  // Adicionar férias como itens especiais na tabela
  if (professionals && professionals.length > 0) {
    professionals.forEach(prof => {
      // Adicionar férias ativas
      if (prof.vacation_active && prof.vacation_start && prof.vacation_end) {
        const startDate = new Date(prof.vacation_start);
        const endDate = new Date(prof.vacation_end);
        
        // Criar uma entrada para cada dia de férias
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          allTableItems.push({
            id: `vacation-${prof.id}-${currentDate.getTime()}`,
            type: 'vacation',
            professional_name: prof.name,
            start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0).toISOString(),
            end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59).toISOString(),
            notes: 'Férias',
            status: 'vacation'
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      // Adicionar pausas para cada dia
      if (prof.break_times) {
        let breakTimes = [];
        try {
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
          
          // Para cada pausa válida, criar entradas para os próximos 30 dias (ou período relevante)
          validBreaks.forEach((breakTime, index) => {
            // Vamos mostrar as pausas apenas para hoje e próximos 7 dias para não poluir muito
            for (let i = 0; i < 7; i++) {
              const breakDate = new Date();
              breakDate.setDate(breakDate.getDate() + i);
              
              // Criar horário de início da pausa
              const [startHour, startMinute] = breakTime.start.split(':');
              const startDateTime = new Date(breakDate.getFullYear(), breakDate.getMonth(), breakDate.getDate(), 
                                           parseInt(startHour), parseInt(startMinute), 0);
              
              // Criar horário de fim da pausa
              const [endHour, endMinute] = breakTime.end.split(':');
              const endDateTime = new Date(breakDate.getFullYear(), breakDate.getMonth(), breakDate.getDate(), 
                                         parseInt(endHour), parseInt(endMinute), 0);
              
              allTableItems.push({
                id: `break-${prof.id}-${index}-${breakDate.getTime()}`,
                type: 'break',
                professional_name: prof.name,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                notes: 'Pausa/Intervalo',
                status: 'break'
              });
            }
          });
        }
      }
    });
  }

  // Ordenar todos os itens por data/hora
  allTableItems.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  if (allTableItems.length === 0) {
    return '<p>Nenhum agendamento encontrado.</p>';
  }

  const tableRows = allTableItems.map(item => {
    const startDate = convertToLocalTime(item.start_time);
    const endDate = convertToLocalTime(item.end_time);
    const startTime = startDate.toLocaleString('pt-BR');
    const endTime = endDate.toLocaleString('pt-BR');
    
    // Para agendamentos normais
    if (item.type !== 'vacation' && item.type !== 'break') {
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
    }
    
    // Para férias
    if (item.type === 'vacation') {
      return `
        <tr style="background-color: #fef3c7;">
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left; font-weight: 600;">🏖️ FÉRIAS</td>
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${item.professional_name}</td>
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">-</td>
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${startDate.toLocaleDateString('pt-BR')}</td>
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">
            <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; background-color: #fbbf2420; color: #f59e0b;">
              Férias
            </span>
          </td>
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${item.notes}</td>
        </tr>
      `;
    }
    
    // Para pausas
    if (item.type === 'break') {
      return `
        <tr style="background-color: #f3f4f6;">
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left; font-weight: 600;">☕ PAUSA</td>
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${item.professional_name}</td>
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">-</td>
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${startTime} - ${endTime}</td>
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">
            <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; background-color: #6b728020; color: #6b7280;">
              Pausa
            </span>
          </td>
          <td style="padding: 8px; border: 1px solid #000 !important; text-align: left;">${item.notes}</td>
        </tr>
      `;
    }
    
    return '';
  }).join('');
  
  return `
    <div style="border-radius: 8px; border: 1px solid #e5e7eb; padding: 24px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #111827;">${tableTitle}</h2>
        <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">Total de itens: ${allTableItems.length} (agendamentos, férias e pausas)</p>
      </div>
      
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; border: 1px solid #000;">
          <thead>
            <tr>
              <th style="border: 1px solid #000 !important; padding: 12px 16px; background-color: #f9fafb; text-align: left; font-weight: 500; color: #374151;">Paciente/Tipo</th>
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
