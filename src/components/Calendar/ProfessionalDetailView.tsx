
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { Appointment } from '@/components/Appointments/types';
import { ProfessionalDetailViewHeader } from './ProfessionalDetailView/ProfessionalDetailViewHeader';
import { DayView } from './ProfessionalDetailView/DayView';
import { MonthView } from './ProfessionalDetailView/MonthView';
import { useProfessionalDetailData } from './ProfessionalDetailView/hooks/useProfessionalDetailData';
import { usePrintReport } from '@/components/Agenda/hooks/usePrintReport';

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchDate, setSearchDate] = useState('');
  const [activeTab, setActiveTab] = useState('day');
  const { toast } = useToast();
  const { handlePrint } = usePrintReport();

  const { appointments, loading, fetchAppointments } = useProfessionalDetailData(
    professional.id, 
    selectedDate
  );

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

  const handleDayClick = (date: Date) => {
    onDateChange(date);
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
                style={{ backgroundColor: professional.color }}
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
                onAppointmentClick={setSelectedAppointment}
              />
            </TabsContent>

            <TabsContent value="month" className="mt-6">
              <MonthView
                professional={professional}
                appointments={appointments}
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
    </div>
  );
}
