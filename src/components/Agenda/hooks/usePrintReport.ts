
import { getCurrentDate, getFormattedDate, openPrintWindow } from './printUtils';
import { fetchProfessionalsData, fetchDateAppointments, fetchAllAppointments } from './printDataFetchers';
import { generateCalendarPrintTemplate, generateTablePrintTemplate } from './printTemplates';

export function usePrintReport() {
  const handlePrint = async (activeTab: string, selectedDate?: Date) => {
    const currentDate = getCurrentDate();
    const displayDate = selectedDate ? getFormattedDate(selectedDate) : currentDate;
    let contentToPrint = '';
    
    try {
      if (activeTab === 'calendar') {
        console.log('Preparing calendar print for date:', selectedDate || 'today');
        
        const [professionals, appointments] = await Promise.all([
          fetchProfessionalsData(),
          fetchDateAppointments(selectedDate)
        ]);

        console.log('Data fetched - Professionals:', professionals?.length, 'Appointments:', appointments?.length);

        if (!professionals || professionals.length === 0) {
          contentToPrint = '<p>Nenhum profissional ativo encontrado para impressão do calendário.</p>';
        } else {
          contentToPrint = generateCalendarPrintTemplate(professionals, appointments || []);
        }
      } else {
        console.log('Preparing table print for date:', selectedDate || 'all');
        
        const appointments = selectedDate ? 
          await fetchDateAppointments(selectedDate) : 
          await fetchAllAppointments();
        
        console.log('Appointments fetched for print:', appointments?.length || 0);
        
        if (!appointments || appointments.length === 0) {
          contentToPrint = '<p>Nenhum agendamento encontrado para impressão da tabela.</p>';
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
    openPrintWindow(contentToPrint, displayDate, activeTab, selectedDate);
  };

  return { handlePrint };
}
