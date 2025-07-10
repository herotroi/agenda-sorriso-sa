import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { ProfessionalDetailView } from './ProfessionalDetailView';
import { DraggableAppointment } from './DraggableAppointment';
import { DroppableTimeSlot } from './DroppableTimeSlot';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/components/Appointments/types';

interface Professional {
  id: string;
  name: string;
  color: string;
}

export function CalendarView() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
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
    fetchProfessionals();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getAppointmentsForProfessional = (professionalId: string) => {
    return appointments.filter(apt => apt.professional_id === professionalId);
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

  const handleProfessionalClick = (professionalId: string) => {
    setSelectedProfessional(professionalId);
  };

  if (selectedProfessional) {
    const professional = professionals.find(p => p.id === selectedProfessional);
    return (
      <ProfessionalDetailView
        professional={professional!}
        onBack={() => setSelectedProfessional(null)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
            <span className="text-lg font-semibold ml-4">
              {selectedDate.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Professional tabs */}
      <ScrollArea className="w-full">
        <div className="flex space-x-2 pb-2">
          {professionals.map((prof) => (
            <button
              key={prof.id}
              onClick={() => handleProfessionalClick(prof.id)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: prof.color + '20',
                color: prof.color,
                border: `1px solid ${prof.color}40`
              }}
            >
              {prof.name}
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid" style={{ gridTemplateColumns: `60px repeat(${professionals.length}, 1fr)` }}>
            {/* Hours column */}
            <div className="border-r">
              <div className="h-12 border-b flex items-center justify-center text-sm font-medium">
                Hora
              </div>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b flex items-start justify-center pt-1 text-xs text-gray-500"
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Professional columns */}
            {professionals.map((prof) => {
              const profAppointments = getAppointmentsForProfessional(prof.id);
              
              return (
                <div key={prof.id} className="border-r relative">
                  <div className="h-12 border-b flex items-center justify-center font-medium text-sm p-2">
                    {prof.name}
                  </div>
                  
                  <div className="relative">
                    {hours.map((hour) => {
                      const hasAppointment = profAppointments.some(apt => {
                        const startHour = new Date(apt.start_time).getHours();
                        return startHour === hour;
                      });

                      return (
                        <DroppableTimeSlot
                          key={hour}
                          hour={hour}
                          professionalId={prof.id}
                          date={selectedDate}
                          hasAppointment={hasAppointment}
                        />
                      );
                    })}
                    
                    {/* Appointments */}
                    {profAppointments.map((appointment) => {
                      const position = getAppointmentPosition(appointment.start_time, appointment.end_time);
                      
                      return (
                        <DraggableAppointment
                          key={appointment.id}
                          appointment={appointment}
                          professionalColor={prof.color}
                          position={position}
                          onClick={() => setSelectedAppointment(appointment)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AppointmentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        selectedDate={selectedDate}
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
