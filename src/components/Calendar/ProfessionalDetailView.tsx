import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { Appointment, Professional } from '@/types';
import { ProfessionalDetailViewHeader } from './ProfessionalDetailView/ProfessionalDetailViewHeader';
import { DayView } from './ProfessionalDetailView/DayView';
import { MonthView } from './ProfessionalDetailView/MonthView';
import { DayProceduresDialog } from './ProfessionalDetailView/DayProceduresDialog';
import { useProfessionalDetailData } from './ProfessionalDetailView/hooks/useProfessionalDetailData';
import { usePrintReport } from '@/components/Agenda/hooks/usePrintReport';
import { supabase } from '@/integrations/supabase/client';
import { generateTimeBlocks } from './hooks/utils/timeBlockUtils';

interface TimeBlock {
  id: string;
  type: 'break' | 'vacation';
  professional_id: string;
  start_time: string;
  end_time: string;
  title: string;
}

interface ProfessionalDetailViewProps {
  professional: Professional;
  onBack: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function ProfessionalDetailView({ 
  professional: initialProfessional, 
  onBack, 
  selectedDate, 
  onDateChange 
}: ProfessionalDetailViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchDate, setSearchDate] = useState('');
  const [activeTab, setActiveTab] = useState('day');
  const [professional, setProfessional] = useState<Professional>(initialProfessional);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [proceduresDialogOpen, setProceduresDialogOpen] = useState(false);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const { handlePrint } = usePrintReport();

  const { appointments, monthAppointments, loading, fetchAppointments } = useProfessionalDetailData(
    professional.id, 
    selectedDate
  );

  useEffect(() => {
    const fetchProfessionalData = async () => {
      try {
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professional.id)
          .single();

        if (error) throw error;

        if (data) {
          // Map database professional to frontend Professional interface
          const processedProfessional: Professional = {
            id: data.id,
            name: data.name,
            specialty: data.specialty || '',
            email: data.email || '',
            phone: data.phone || '',
            cro: data.crm_cro || '',
            services: [],
            workingHours: {
              monday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
              tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
              wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
              thursday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
              friday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
              saturday: { isWorking: false, startTime: '08:00', endTime: '18:00' },
              sunday: { isWorking: false, startTime: '08:00', endTime: '18:00' }
            },
            calendarColor: data.color || '#3b82f6',
            isActive: data.active !== false,
            documents: [],
            createdAt: data.created_at || new Date().toISOString(),
            // Include database fields for compatibility
            color: data.color,
            working_hours: data.working_hours,
            active: data.active,
            crm_cro: data.crm_cro,
            first_shift_start: data.first_shift_start,
            first_shift_end: data.first_shift_end,
            second_shift_start: data.second_shift_start,
            second_shift_end: data.second_shift_end,
            vacation_active: data.vacation_active,
            vacation_start: data.vacation_start,
            vacation_end: data.vacation_end,
            break_times: data.break_times,
            working_days: Array.isArray(data.working_days) ? data.working_days as boolean[] : [true, true, true, true, true, false, false],
            weekend_shift_active: data.weekend_shift_active,
            weekend_shift_start: data.weekend_shift_start,
            weekend_shift_end: data.weekend_shift_end,
            updated_at: data.updated_at,
            user_id: data.user_id
          };
          setProfessional(processedProfessional);
        }
      } catch (error) {
        console.error('Error fetching professional data:', error);
      }
    };

    fetchProfessionalData();
  }, [professional.id]);

  useEffect(() => {
    if (professional && (professional.break_times || professional.vacation_active)) {
      const blocks = generateTimeBlocks([professional], selectedDate);
      setTimeBlocks(blocks);
    }
  }, [professional, selectedDate]);

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

  const handleDayClick = (date: Date, dayAppointments?: Appointment[]) => {
    if (dayAppointments && dayAppointments.length > 0) {
      setSelectedDayDate(date);
      setSelectedDayAppointments(dayAppointments);
      setProceduresDialogOpen(true);
    } else {
      onDateChange(date);
    }
  };

  const handlePrintProfessional = () => {
    const printActiveTab = activeTab === 'day' ? 'calendar' : 'table';
    const printDate = activeTab === 'day' ? selectedDate : undefined;
    handlePrint(printActiveTab, printDate, professional.id);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <ProfessionalDetailViewHeader
        onBack={onBack}
        onNavigateDate={navigateDate}
        onGoToToday={goToToday}
        searchDate={searchDate}
        onSearchDateChange={setSearchDate}
        onSearchDate={handleSearchDate}
        onNewAppointment={() => setIsFormOpen(true)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: professional.calendarColor }}
              />
              {professional.name} - {selectedDate.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <Button
              onClick={handlePrintProfessional}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir Relatório
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="day">Dia</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
            </TabsList>

            <TabsContent value="day" className="mt-6">
              <DayView
                professional={professional}
                appointments={appointments}
                timeBlocks={timeBlocks}
                onAppointmentClick={setSelectedAppointment}
              />
            </TabsContent>

            <TabsContent value="month" className="mt-6">
              <MonthView
                professional={professional}
                appointments={monthAppointments}
                selectedDate={selectedDate}
                onNavigateMonth={navigateMonth}
                onDayClick={handleDayClick}
              />
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

      <DayProceduresDialog
        isOpen={proceduresDialogOpen}
        onClose={() => setProceduresDialogOpen(false)}
        date={selectedDayDate}
        appointments={selectedDayAppointments}
        professionalName={professional.name}
        professionalColor={professional.calendarColor}
      />
    </div>
  );
}
