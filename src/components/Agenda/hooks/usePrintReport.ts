
import { getCurrentDate, getFormattedDate, openPrintWindow } from './printUtils';
import { fetchProfessionalsData, fetchDateAppointments, fetchAllAppointments } from './printDataFetchers';
import { generateCalendarPrintTemplate, generateTablePrintTemplate } from './printTemplates';

export function usePrintReport() {
  const handlePrint = async (activeTab: string, selectedDate?: Date, professionalId?: string) => {
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

        // Filter professionals if specific professional is selected
        const professionals = professionalId 
          ? allProfessionals.filter(prof => prof.id === professionalId)
          : allProfessionals;

        console.log('Data fetched - Professionals:', professionals?.length, 'Appointments:', appointments?.length);

        if (!professionals || professionals.length === 0) {
          contentToPrint = professionalId 
            ? '<p>Profissional não encontrado para impressão do calendário.</p>'
            : '<p>Nenhum profissional ativo encontrado para impressão do calendário.</p>';
        } else {
          contentToPrint = generateCalendarPrintTemplate(professionals, appointments || []);
        }
      } else {
        console.log('Preparing table print for date:', selectedDate || 'all', 'professional:', professionalId || 'all');
        
        const appointments = selectedDate ? 
          await fetchDateAppointments(selectedDate, professionalId) : 
          await fetchAllAppointments(professionalId);
        
        console.log('Appointments fetched for print:', appointments?.length || 0);
        
        if (!appointments || appointments.length === 0) {
          const professionalText = professionalId ? ' para este profissional' : '';
          contentToPrint = `<p>Nenhum agendamento encontrado${professionalText} para impressão da tabela.</p>`;
        } else {
          contentToPrint = generateTablePrintTemplate(appointments);
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
