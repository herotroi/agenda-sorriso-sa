
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

        contentToPrint = generateCalendarPrintTemplate(professionals, appointments);
      } else {
        console.log('Preparing table print...');
        
        const appointments = await fetchAllAppointments();
        console.log('Appointments fetched for print:', appointments);
        
        contentToPrint = generateTablePrintTemplate(appointments);
      }
    } catch (error) {
      console.error('Error in print function:', error);
      contentToPrint = '<p>Erro ao preparar dados para impressão.</p>';
    }

    openPrintWindow(contentToPrint, currentDate, activeTab);
  };

  return { handlePrint };
}
