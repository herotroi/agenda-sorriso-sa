
import { getCurrentDate, openPrintWindow } from './printUtils';
import { fetchProfessionalsData, fetchTodayAppointments, fetchAllAppointments } from './printDataFetchers';
import { generateCalendarPrintTemplate, generateTablePrintTemplate } from './printTemplates';

export function usePrintReport() {
  const handlePrint = async (activeTab: string) => {
    const currentDate = getCurrentDate();
    let contentToPrint = '';
    
    try {
      if (activeTab === 'calendar') {
        console.log('Preparing calendar print...');
        
        const [professionals, appointments] = await Promise.all([
          fetchProfessionalsData(),
          fetchTodayAppointments()
        ]);

        console.log('Data fetched - Professionals:', professionals?.length, 'Appointments:', appointments?.length);

        if (!professionals || professionals.length === 0) {
          contentToPrint = '<p>Nenhum profissional ativo encontrado para impressão do calendário.</p>';
        } else {
          contentToPrint = generateCalendarPrintTemplate(professionals, appointments || []);
        }
      } else {
        console.log('Preparing table print...');
        
        const appointments = await fetchAllAppointments();
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
    openPrintWindow(contentToPrint, currentDate, activeTab);
  };

  return { handlePrint };
}
