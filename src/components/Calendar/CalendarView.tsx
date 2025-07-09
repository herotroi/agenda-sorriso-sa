
import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { ptBR },
});

const messages = {
  allDay: 'Dia todo',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+ Ver mais (${total})`,
};

// Dados mockados para demonstração
const mockEvents = [
  {
    id: 1,
    title: 'João Silva - Limpeza',
    start: new Date(2024, 0, 15, 9, 0),
    end: new Date(2024, 0, 15, 10, 0),
    resource: 'dr-silva',
  },
  {
    id: 2,
    title: 'Maria Santos - Canal',
    start: new Date(2024, 0, 15, 14, 0),
    end: new Date(2024, 0, 15, 16, 0),
    resource: 'dr-silva',
  },
  {
    id: 3,
    title: 'Pedro Oliveira - Extração',
    start: new Date(2024, 0, 16, 10, 30),
    end: new Date(2024, 0, 16, 11, 30),
    resource: 'dr-costa',
  },
];

const professionals = [
  { id: 'all', name: 'Todos os Profissionais' },
  { id: 'dr-silva', name: 'Dr. Silva' },
  { id: 'dr-costa', name: 'Dra. Costa' },
  { id: 'dr-santos', name: 'Dr. Santos' },
];

export function CalendarView() {
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3b82f6';
    
    if (event.resource === 'dr-silva') backgroundColor = '#10b981';
    if (event.resource === 'dr-costa') backgroundColor = '#f59e0b';
    if (event.resource === 'dr-santos') backgroundColor = '#ef4444';

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const filteredEvents = selectedProfessional === 'all' 
    ? mockEvents 
    : mockEvents.filter(event => event.resource === selectedProfessional);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {professionals.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  {prof.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              Hoje
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
          >
            Dia
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            Semana
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            Mês
          </Button>
          <Button size="sm" className="ml-4">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              messages={messages}
              view={view}
              onView={setView}
              date={currentDate}
              onNavigate={setCurrentDate}
              eventPropGetter={eventStyleGetter}
              culture="pt-BR"
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
