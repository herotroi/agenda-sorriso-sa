import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const { toast } = useToast();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

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
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
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

  const goToToday = () => {
    onDateChange(new Date());
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

  const getStatusColor = (statusColor: string) => {
    return `border-l-4` + ` border-[${statusColor}]`;
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Dia</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="year">Ano</TabsTrigger>
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
              <div className="text-center text-gray-500 py-8">
                Visualização mensal em desenvolvimento
              </div>
            </TabsContent>

            <TabsContent value="year" className="mt-6">
              <div className="text-center text-gray-500 py-8">
                Visualização anual em desenvolvimento
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
