
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Professional, Appointment } from '@/types';
import { ProfessionalDetailViewHeader } from './ProfessionalDetailView/ProfessionalDetailViewHeader';
import { DayView } from './ProfessionalDetailView/DayView';
import { MonthView } from './ProfessionalDetailView/MonthView';
import { PrintButton } from './ProfessionalDetailView/PrintButton';
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { useProfessionalDetailData } from './ProfessionalDetailView/hooks/useProfessionalDetailData';

interface ProfessionalDetailViewProps {
  professional: Professional;
  selectedDate: Date;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfessionalDetailView({
  professional,
  selectedDate: initialDate,
  isOpen,
  onClose
}: ProfessionalDetailViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<'day' | 'month'>('day');
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const { appointments, monthAppointments, loading, handleAppointmentClick } = useProfessionalDetailData(
    professional.id,
    currentDate
  );

  // Ensure professional has required working_hours property
  const professionalWithDefaults = {
    ...professional,
    working_hours: professional.working_hours || { start: "08:00", end: "18:00" }
  };

  const handleNewAppointment = () => {
    setIsAppointmentFormOpen(true);
  };

  const handleAppointmentFormClose = () => {
    setIsAppointmentFormOpen(false);
  };

  const handleAppointmentDetailsClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentDetailsClose = () => {
    setSelectedAppointment(null);
  };

  const handleAppointmentUpdate = () => {
    // Refresh data after appointment update
    window.location.reload();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl w-[95vw] h-[95vh] p-0 flex flex-col">
          {/* Header fixo */}
          <div className="flex-shrink-0 p-6 border-b bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Detalhes do Profissional - {professional.name}
                </div>
                <div className="flex items-center gap-2">
                  <PrintButton 
                    professional={professionalWithDefaults} 
                    currentDate={currentDate} 
                    view={view} 
                  />
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Fechar">
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Área de conteúdo com scroll */}
          <ScrollArea className="flex-1 h-full">
            <div className="p-6 space-y-4">
              <ProfessionalDetailViewHeader
                professional={professionalWithDefaults}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onNewAppointment={handleNewAppointment}
                view={view}
              />

              <Tabs value={view} onValueChange={(value) => setView(value as 'day' | 'month')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="day" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Visão Diária
                  </TabsTrigger>
                  <TabsTrigger value="month" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Visão Mensal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="day" className="mt-0">
                  <DayView
                    professional={professionalWithDefaults}
                    appointments={appointments}
                    currentDate={currentDate}
                    loading={loading}
                    onAppointmentClick={handleAppointmentDetailsClick}
                  />
                </TabsContent>
                
                <TabsContent value="month" className="mt-0">
                  <MonthView
                    professional={professionalWithDefaults}
                    appointments={monthAppointments}
                    selectedDate={currentDate}
                    onDateChange={setCurrentDate}
                    onAppointmentClick={handleAppointmentDetailsClick}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
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
          isOpen={!!selectedAppointment}
          onClose={handleAppointmentDetailsClose}
          onUpdate={handleAppointmentUpdate}
        />
      )}
    </>
  );
}
