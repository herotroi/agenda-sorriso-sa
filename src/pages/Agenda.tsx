
import { useState } from 'react';
import { AgendaHeader } from '@/components/Agenda/AgendaHeader';
import { AgendaTabs } from '@/components/Agenda/AgendaTabs';
import { usePrintReport } from '@/components/Agenda/hooks/usePrintReport';

export default function Agenda() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { handlePrint } = usePrintReport();

  const onPrint = () => {
    handlePrint(activeTab, selectedDate);
  };

  return (
    <div className="space-y-6">
      <AgendaHeader onPrint={onPrint} />
      <AgendaTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  );
}
