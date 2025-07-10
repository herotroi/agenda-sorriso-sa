
import { useState } from 'react';
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { ProfessionalDetailView } from './ProfessionalDetailView';
import { CalendarHeader } from './CalendarHeader';
import { ProfessionalTabs } from './ProfessionalTabs';
import { CalendarGrid } from './CalendarGrid';
import { useCalendarData } from './hooks/useCalendarData';
import { Appointment } from '@/components/Appointments/types';

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { professionals, appointments, loading, refreshAppointments } = useCalendarData(selectedDate);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    refreshAppointments();
  };

  const handleDetailsClose = () => {
    setSelectedAppointment(null);
    refreshAppointments();
  };

  const handleAppointmentUpdate = () => {
    refreshAppointments();
  };

  const handleProfessionalClick = (professionalId: string) => {
    setSelectedProfessional(professionalId);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
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
      <CalendarHeader
        selectedDate={selectedDate}
        onNavigateDate={navigateDate}
        onGoToToday={goToToday}
        onNewAppointment={() => setIsFormOpen(true)}
      />

      <ProfessionalTabs
        professionals={professionals}
        onProfessionalClick={handleProfessionalClick}
      />

      <CalendarGrid
        professionals={professionals}
        appointments={appointments}
        selectedDate={selectedDate}
        onAppointmentClick={handleAppointmentClick}
      />

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
