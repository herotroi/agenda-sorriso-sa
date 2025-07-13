
import { useState } from 'react';
import { Appointment } from '@/types';

export function useCalendarState() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
    return newDate;
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    return today;
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleDetailsClose = () => {
    setSelectedAppointment(null);
  };

  const handleProfessionalClick = (professionalId: string) => {
    setSelectedProfessional(professionalId);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleBackToProfessionalList = () => {
    setSelectedProfessional(null);
  };

  return {
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
  };
}
