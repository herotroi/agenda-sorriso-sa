
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

  if (selectedProfessional) {
    const professional = professionals.find(p => p.id === selectedProfessional);
    if (professional) {
      // Map the professional to include all required fields
      const mappedProfessional = {
        ...professional,
        specialty: professional.specialty || '',
        email: professional.email || '',
        phone: professional.phone || '',
        cro: professional.crm_cro || '',
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
        calendarColor: professional.color || '#3b82f6',
        isActive: professional.active !== false,
        documents: [],
        createdAt: professional.created_at || new Date().toISOString()
      };
      
      return (
        <div className={`${isMobile ? 'px-2' : 'px-4'}`}>
          <ProfessionalDetailView
            professional={mappedProfessional}
            onBack={handleBackToProfessionalList}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
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

  // Map professionals to ensure they have all required fields
  const mappedProfessionals = professionals.map(prof => ({
    ...prof,
    specialty: prof.specialty || '',
    email: prof.email || '',
    phone: prof.phone || '',
    cro: prof.crm_cro || '',
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
    calendarColor: prof.color || '#3b82f6',
    isActive: prof.active !== false,
    documents: [],
    createdAt: prof.created_at || new Date().toISOString()
  }));

  return (
    <div className={`${isMobile ? 'px-1' : 'px-4'}`}>
      <CalendarContent
        professionals={mappedProfessionals}
        appointments={appointments}
        timeBlocks={timeBlocks}
        selectedDate={selectedDate}
        onNavigateDate={handleNavigateDate}
        onGoToToday={handleGoToToday}
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
    </div>
  );
}
