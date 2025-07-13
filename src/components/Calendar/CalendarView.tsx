
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
      // Map the database professional to frontend interface
      const mappedProfessional = {
        id: professional.id,
        name: professional.name,
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
        createdAt: professional.created_at || new Date().toISOString(),
        // Include database fields for compatibility
        color: professional.color,
        working_hours: professional.working_hours,
        active: professional.active,
        crm_cro: professional.crm_cro,
        first_shift_start: professional.first_shift_start,
        first_shift_end: professional.first_shift_end,
        second_shift_start: professional.second_shift_start,
        second_shift_end: professional.second_shift_end,
        vacation_active: professional.vacation_active,
        vacation_start: professional.vacation_start,
        vacation_end: professional.vacation_end,
        break_times: professional.break_times,
        working_days: professional.working_days,
        weekend_shift_active: professional.weekend_shift_active,
        weekend_shift_start: professional.weekend_shift_start,
        weekend_shift_end: professional.weekend_shift_end,
        updated_at: professional.updated_at,
        user_id: professional.user_id
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
    id: prof.id,
    name: prof.name,
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
    createdAt: prof.created_at || new Date().toISOString(),
    // Include database fields for compatibility
    color: prof.color,
    working_hours: prof.working_hours,
    active: prof.active,
    crm_cro: prof.crm_cro,
    first_shift_start: prof.first_shift_start,
    first_shift_end: prof.first_shift_end,
    second_shift_start: prof.second_shift_start,
    second_shift_end: prof.second_shift_end,
    vacation_active: prof.vacation_active,
    vacation_start: prof.vacation_start,
    vacation_end: prof.vacation_end,
    break_times: prof.break_times,
    working_days: prof.working_days,
    weekend_shift_active: prof.weekend_shift_active,
    weekend_shift_start: prof.weekend_shift_start,
    weekend_shift_end: prof.weekend_shift_end,
    updated_at: prof.updated_at,
    user_id: prof.user_id
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
