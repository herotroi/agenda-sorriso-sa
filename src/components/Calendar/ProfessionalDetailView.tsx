
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProfessionalDetailViewHeader } from './ProfessionalDetailView/ProfessionalDetailViewHeader';
import { DayView } from './ProfessionalDetailView/DayView';
import { MonthView } from './ProfessionalDetailView/MonthView';
import { useProfessionalDetailData } from './ProfessionalDetailView/hooks/useProfessionalDetailData';
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { Professional } from '@/types';

interface ProfessionalDetailViewProps {
  professional: Professional;
  selectedDate: Date;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfessionalDetailView({ 
  professional, 
  selectedDate, 
  isOpen, 
  onClose 
}: ProfessionalDetailViewProps) {
  const [currentView, setCurrentView] = useState<'day' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);

  const { appointments, monthAppointments, loading, fetchAppointments } = useProfessionalDetailData(
    professional.id, 
    currentDate
  );

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleNewAppointment = () => {
    setIsAppointmentFormOpen(true);
  };

  const handleAppointmentFormClose = () => {
    setIsAppointmentFormOpen(false);
    fetchAppointments();
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailsOpen(true);
  };

  const handleAppointmentDetailsClose = () => {
    setIsAppointmentDetailsOpen(false);
    setSelectedAppointment(null);
    fetchAppointments();
  };

  // Tratar propriedades JSON do profissional
  const breakTimes = Array.isArray(professional.break_times) 
    ? professional.break_times 
    : (typeof professional.break_times === 'string' ? JSON.parse(professional.break_times || '[]') : []);
    
  const workingDays = Array.isArray(professional.working_days)
    ? professional.working_days
    : (typeof professional.working_days === 'string' ? JSON.parse(professional.working_days || '[true,true,true,true,true,false,false]') : [true,true,true,true,true,false,false]);

  const professionalWithParsedData = {
    ...professional,
    break_times: breakTimes,
    working_days: workingDays
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    {professional.name}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={currentView === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('day')}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Dia
                </Button>
                <Button
                  variant={currentView === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('month')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Mês
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ProfessionalDetailViewHeader
              professional={professionalWithParsedData}
              currentDate={currentDate}
              onDateChange={handleDateChange}
              onNewAppointment={handleNewAppointment}
              view={currentView}
            />
            
            <div className="px-6 pb-6 h-[calc(95vh-180px)] overflow-auto">
              {currentView === 'day' ? (
                <DayView
                  professional={professionalWithParsedData}
                  appointments={appointments}
                  selectedDate={currentDate}
                  loading={loading}
                  onAppointmentClick={handleAppointmentClick}
                />
              ) : (
                <MonthView
                  professional={professionalWithParsedData}
                  appointments={monthAppointments}
                  selectedDate={currentDate}
                  onDateChange={handleDateChange}
                  onAppointmentClick={handleAppointmentClick}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={handleAppointmentFormClose}
        selectedDate={currentDate}
        selectedProfessionalId={professional.id}
      />

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          isOpen={isAppointmentDetailsOpen}
          onClose={handleAppointmentDetailsClose}
          onUpdate={fetchAppointments}
        />
      )}
    </>
  );
}
