
import { useState } from 'react';
import { AgendaHeader } from '@/components/Agenda/AgendaHeader';
import { AgendaTabs } from '@/components/Agenda/AgendaTabs';
import { usePrintReport } from '@/components/Agenda/hooks/usePrintReport';

export default function Agenda() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState<{ statusId?: number; procedureId?: string }>({});
  const { handlePrint } = usePrintReport();

  const onPrint = () => {
    // Para a aba de tabela, passar os filtros ativos
    if (activeTab === 'table') {
      handlePrint(activeTab, selectedDate, undefined, activeFilters);
    } else {
      handlePrint(activeTab, selectedDate);
    }
  };

  const handleFiltersChange = (filters: { statusId?: number; procedureId?: string }) => {
    setActiveFilters(filters);
  };

  return (
    <div className="space-y-6">
      <AgendaHeader onPrint={onPrint} />
      <AgendaTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
