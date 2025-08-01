
import { ProfessionalDetailView } from './ProfessionalDetailView';
import { CalendarContent } from './CalendarContent';
import { CalendarModals } from './CalendarModals';
import { useCalendarData } from './hooks/useCalendarData';
import { useCalendarState } from './hooks/useCalendarState';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarViewProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function CalendarView({ selectedDate: externalSelectedDate, onDateChange: externalOnDateChange }: CalendarViewProps = {}) {
  const isMobile = useIsMobile();
  const {
    selectedDate: internalSelectedDate,
    setSelectedDate: setInternalSelectedDate,
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

  // Use external date if provided, otherwise use internal state
  const selectedDate = externalSelectedDate || internalSelectedDate;
  
  const setSelectedDate = (date: Date) => {
    setInternalSelectedDate(date);
    if (externalOnDateChange) {
      externalOnDateChange(date);
    }
  };

  const { professionals, appointments, timeBlocks, loading, refreshAppointments } = useCalendarData(selectedDate);

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

  const handleNavigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
    return newDate;
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    return today;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  if (selectedProfessional) {
    const professional = professionals.find(p => p.id === selectedProfessional);
    if (professional) {
      return (
        <div className={`${isMobile ? 'px-2' : 'px-4'}`}>
          <ProfessionalDetailView
            professional={professional}
            selectedDate={selectedDate}
            isOpen={true}
            onClose={handleBackToProfessionalList}
          />
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-sm text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'px-1' : 'px-4'}`}>
      <CalendarContent
        professionals={professionals}
        appointments={appointments}
        timeBlocks={timeBlocks}
        selectedDate={selectedDate}
        onNavigateDate={handleNavigateDate}
        onGoToToday={handleGoToToday}
        onNewAppointment={() => setIsFormOpen(true)}
        onProfessionalClick={handleProfessionalClick}
        onAppointmentClick={handleAppointmentClick}
        onDateSelect={handleDateSelect}
      />

      <CalendarModals
        isFormOpen={isFormOpen}
        onFormClose={handleFormCloseWithRefresh}
        selectedDate={selectedDate}
        selectedAppointment={selectedAppointment}
        onDetailsClose={handleDetailsCloseWithRefresh}
        onUpdate={handleAppointmentUpdate}
      />
    </div>
  );
}
