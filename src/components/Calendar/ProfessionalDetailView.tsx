
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Search, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { Appointment } from '@/components/Appointments/types';

interface Professional {
  id: string;
  name: string;
  color: string;
}

interface ProfessionalDetailViewProps {
  professional: Professional;
  onBack: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function ProfessionalDetailView({ 
  professional, 
  onBack, 
  selectedDate, 
  onDateChange 
}: ProfessionalDetailViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchDate, setSearchDate] = useState('');
  const { toast } = useToast();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const fetchAppointments = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      const start = startDate || new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      
      const end = endDate || new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(full_name),
          professionals(name),
          procedures(name),
          appointment_statuses(label, color)
        `)
        .eq('professional_id', professional.id)
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .order('start_time');

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, professional.id]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const handleSearchDate = () => {
    if (searchDate) {
      const date = new Date(searchDate);
      if (!isNaN(date.getTime())) {
        onDateChange(date);
        setSearchDate('');
      } else {
        toast({
          title: 'Data inválida',
          description: 'Por favor, insira uma data válida',
          variant: 'destructive',
        });
      }
    }
  };

  const getAppointmentPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return {
      top: `${startHour * 60}px`,
      height: `${duration * 60}px`
    };
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchAppointments();
  };

  const handleDetailsClose = () => {
    setSelectedAppointment(null);
    fetchAppointments();
  };

  const handleAppointmentUpdate = () => {
    fetchAppointments();
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getAppointmentsForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate >= dayStart && aptDate <= dayEnd;
    });
  };

  const handleDayClick = (date: Date) => {
    onDateChange(date);
  };

  const monthDays = getDaysInMonth(selectedDate);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              placeholder="Buscar data..."
              className="w-40"
            />
            <Button variant="outline" size="sm" onClick={handleSearchDate}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: professional.color }}
            />
            {professional.name} - {selectedDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="day" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="day">Dia</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
            </TabsList>

            <TabsContent value="day" className="mt-6">
              <div className="relative border rounded-lg">
                {/* Timeline */}
                <div className="grid grid-cols-[80px_1fr]">
                  {/* Hours column */}
                  <div className="border-r">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-[60px] border-b flex items-start justify-center pt-1 text-xs text-gray-500"
                      >
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>

                  {/* Appointments column */}
                  <div className="relative">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-[60px] border-b border-gray-100 hover:bg-gray-50"
                      />
                    ))}
                    
                    {/* Appointments */}
                    {appointments.map((appointment) => {
                      const position = getAppointmentPosition(appointment.start_time, appointment.end_time);
                      
                      return (
                        <div
                          key={appointment.id}
                          onClick={() => setSelectedAppointment(appointment)}
                          className={`absolute left-1 right-1 rounded p-2 text-xs text-white cursor-pointer hover:opacity-80 transition-opacity border-l-4`}
                          style={{
                            ...position,
                            backgroundColor: professional.color,
                            borderLeftColor: appointment.appointment_statuses?.color || '#6b7280',
                            minHeight: '40px'
                          }}
                        >
                          <div className="font-medium truncate">
                            {appointment.patients?.full_name}
                          </div>
                          <div className="truncate opacity-90">
                            {appointment.procedures?.name}
                          </div>
                          <div className="text-xs opacity-75">
                            {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(appointment.end_time).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="text-xs font-semibold">
                            {appointment.appointment_statuses?.label || appointment.status}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="month" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-lg font-semibold">
                    {selectedDate.toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {/* Cabeçalhos dos dias da semana */}
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="p-2 text-center font-semibold text-sm text-gray-600">
                      {day}
                    </div>
                  ))}

                  {/* Espaços vazios para o primeiro dia do mês */}
                  {Array.from({ length: monthDays[0]?.getDay() || 0 }).map((_, index) => (
                    <div key={index} className="p-2"></div>
                  ))}

                  {/* Dias do mês */}
                  {monthDays.map((day) => {
                    const dayAppointments = getAppointmentsForDay(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isSelected = day.toDateString() === selectedDate.toDateString();

                    return (
                      <div
                        key={day.getDate()}
                        onClick={() => handleDayClick(day)}
                        className={`
                          p-2 min-h-[80px] border rounded cursor-pointer hover:bg-gray-50 transition-colors
                          ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                          ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                        `}
                      >
                        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                          {day.getDate()}
                        </div>
                        {dayAppointments.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <div
                                key={apt.id}
                                className="text-xs p-1 rounded text-white truncate"
                                style={{ backgroundColor: professional.color }}
                              >
                                {apt.patients?.full_name}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayAppointments.length - 2} mais
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AppointmentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        selectedDate={selectedDate}
        selectedProfessionalId={professional.id}
      />

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={handleDetailsClose}
          onUpdate={handleAppointmentUpdate}
        />
      )}
    </div>
  );
}
