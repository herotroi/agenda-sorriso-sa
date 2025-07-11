
import { getCurrentDate, getFormattedDate, openPrintWindow } from './printUtils';
import { fetchProfessionalsData, fetchDateAppointments, fetchAllAppointments, fetchFilteredAppointments } from './printDataFetchers';
import { generateCalendarPrintTemplate, generateTablePrintTemplate } from './printTemplates';
import { Professional } from './printTemplates/types';

export function usePrintReport() {
  const handlePrint = async (
    activeTab: string, 
    selectedDate?: Date, 
    professionalId?: string,
    filters?: { statusId?: number; procedureId?: string }
  ) => {
    const currentDate = getCurrentDate();
    const displayDate = selectedDate ? getFormattedDate(selectedDate) : currentDate;
    let contentToPrint = '';
    
    try {
      if (activeTab === 'calendar') {
        console.log('Preparing calendar print for date:', selectedDate || 'today', 'professional:', professionalId || 'all');
        
        const [allProfessionals, appointments] = await Promise.all([
          fetchProfessionalsData(),
          fetchDateAppointments(selectedDate, professionalId)
        ]);

        // Convert and filter professionals with proper type handling
        const convertedProfessionals: Professional[] = allProfessionals.map(prof => ({
          id: prof.id,
          name: prof.name,
          active: prof.active || false,
          break_times: (Array.isArray(prof.break_times) ? prof.break_times : []) as Array<{ start: string; end: string }>,
          vacation_active: Boolean(prof.vacation_active),
          vacation_start: prof.vacation_start || undefined,
          vacation_end: prof.vacation_end || undefined,
          working_days: Array.isArray(prof.working_days) ? prof.working_days as boolean[] : undefined
        }));

        const professionals = professionalId 
          ? convertedProfessionals.filter(prof => prof.id === professionalId)
          : convertedProfessionals;

        console.log('Data fetched - Professionals:', professionals?.length, 'Appointments:', appointments?.length);

        if (!professionals || professionals.length === 0) {
          contentToPrint = professionalId 
            ? '<p>Profissional não encontrado para impressão do calendário.</p>'
            : '<p>Nenhum profissional ativo encontrado para impressão do calendário.</p>';
        } else {
          // Passar selectedDate para o template do calendário
          contentToPrint = generateCalendarPrintTemplate(professionals, appointments || [], selectedDate);
        }
      } else {
        console.log('Preparing table print with filters:', filters, 'professional:', professionalId || 'all');
        
        let appointments;
        
        // Se há filtros ativos, usar função de busca filtrada
        if (filters && (filters.statusId || filters.procedureId)) {
          appointments = await fetchFilteredAppointments(filters, professionalId);
        } else {
          // Usar função padrão se não há filtros
          appointments = selectedDate ? 
            await fetchDateAppointments(selectedDate, professionalId) : 
            await fetchAllAppointments(professionalId);
        }

        const allProfessionals = await fetchProfessionalsData();

        // Convert professionals with proper type handling for table template
        const convertedProfessionals = allProfessionals.map(prof => ({
          ...prof,
          break_times: Array.isArray(prof.break_times) ? prof.break_times as Array<{ start: string; end: string }> : [],
          vacation_active: prof.vacation_active || false,
          vacation_start: prof.vacation_start || undefined,
          vacation_end: prof.vacation_end || undefined,
          working_days: Array.isArray(prof.working_days) ? prof.working_days as boolean[] : undefined
        }));

        // Filter professionals if specific professional is selected
        const professionals = professionalId 
          ? convertedProfessionals.filter(prof => prof.id === professionalId)
          : convertedProfessionals;
        
        console.log('Appointments fetched for print:', appointments?.length || 0);
        
        if (!appointments || appointments.length === 0) {
          const professionalText = professionalId ? ' para este profissional' : '';
          const filtersText = filters && (filters.statusId || filters.procedureId) ? ' com os filtros aplicados' : '';
          contentToPrint = `<p>Nenhum agendamento encontrado${professionalText}${filtersText} para impressão da tabela.</p>`;
        } else {
          contentToPrint = generateTablePrintTemplate(appointments, professionals);
        }
      }
    } catch (error) {
      console.error('Error in print function:', error);
      contentToPrint = `
        <div class="error-message">
          <h3>Erro ao preparar dados para impressão</h3>
          <p>Não foi possível carregar os dados. Tente novamente.</p>
          <p><small>Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}</small></p>
        </div>
      `;
    }

    console.log('Opening print window with content length:', contentToPrint.length);
    openPrintWindow(contentToPrint, displayDate, activeTab, selectedDate, professionalId);
  };

  return { handlePrint };
}
