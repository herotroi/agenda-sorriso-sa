
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppointmentsData } from './hooks/useAppointmentsData';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentsFilters } from './AppointmentsFilters';
import { AppointmentsTableHeader } from './AppointmentsTableHeader';
import { AppointmentsTableContent } from './AppointmentsTableContent';

export function AppointmentsTable() {
  const {
    appointments,
    setAppointments,
    loading,
    refreshing,
    handleManualRefresh,
    handleFiltersChange,
    activeFilters
  } = useAppointmentsData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);

  const handleCreate = () => {
    console.log('Opening create form');
    setAppointmentToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (appointment: any, event: React.MouseEvent) => {
    console.log('Edit button clicked for appointment:', appointment.id);
    event.preventDefault();
    event.stopPropagation();
    
    setAppointmentToEdit(appointment);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    console.log('Closing form');
    setIsFormOpen(false);
    setAppointmentToEdit(null);
    handleManualRefresh();
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p>Carregando agendamentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <AppointmentsFilters onFiltersChange={handleFiltersChange} />

      <Card data-testid="appointments-table">
        <AppointmentsTableHeader
          appointmentsCount={appointments.length}
          hasActiveFilters={hasActiveFilters}
          onCreateAppointment={handleCreate}
          onRefresh={handleManualRefresh}
          refreshing={refreshing}
        />
        <CardContent>
          <AppointmentsTableContent
            appointments={appointments}
            hasActiveFilters={hasActiveFilters}
            onCreateAppointment={handleCreate}
            onEditAppointment={handleEdit}
          />
        </CardContent>
      </Card>

      <AppointmentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        selectedDate={new Date()}
        appointmentToEdit={appointmentToEdit}
      />
    </>
  );
}
