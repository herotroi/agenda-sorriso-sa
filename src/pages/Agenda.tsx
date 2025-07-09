
import { CalendarView } from '@/components/Calendar/CalendarView';

export default function Agenda() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-600">Gerencie os agendamentos da clínica</p>
      </div>
      
      <CalendarView />
    </div>
  );
}
