
import { ProfessionalDetailView } from './ProfessionalDetailView';
import { CalendarContent } from './CalendarContent';
import { CalendarModals } from './CalendarModals';
import { useCalendarData } from './hooks/useCalendarData';
import { useCalendarState } from './hooks/useCalendarState';

export function CalendarView() {
  const {
    selectedDate,
    setSelectedDate,
    isFormOpen,
    setIsFormOpen,
    selectedProfessional,
    selectedAppointment,
    navigateDate,
    goToToday,
    handleFormClose,
    handleDetailsClose,
    handleProfessionalClick,
    handleAppointmentClick,
    handleBackToProfessionalList,
  } = useCalendarState();

  const { professionals, appointments, loading, refreshAppointments } = useCalendarData(selectedDate);

  const handleFormCloseWithRefresh = () => {
    handleFormClose();
    refreshAppointments();
  };

  const handleDetailsCloseWithRefresh = () => {
    handleDetailsClose();
    refreshAppointments();
  };

  const handleAppointmentUpdate = () => {
    refreshAppointments();
  };

  if (selectedProfessional) {
    const professional = professionals.find(p => p.id === selectedProfessional);
    return (
      <ProfessionalDetailView
        professional={professional!}
        onBack={handleBackToProfessionalList}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <>
      <CalendarContent
        professionals={professionals}
        appointments={appointments}
        selectedDate={selectedDate}
        onNavigateDate={navigateDate}
        onGoToToday={goToToday}
        onNewAppointment={() => setIsFormOpen(true)}
        onProfessionalClick={handleProfessionalClick}
        onAppointmentClick={handleAppointmentClick}
      />

      <CalendarModals
        isFormOpen={isFormOpen}
        onFormClose={handleFormCloseWithRefresh}
        selectedDate={selectedDate}
        selectedAppointment={selectedAppointment}
        onDetailsClose={handleDetailsCloseWithRefresh}
        onUpdate={handleAppointmentUpdate}
      />
    </>
  );
}
