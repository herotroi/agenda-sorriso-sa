
import { useState } from 'react';
import { useAppointmentsData } from './hooks/useAppointmentsData';
import { AppointmentsTableHeader } from './AppointmentsTableHeader';
import { AppointmentsTableContent } from './AppointmentsTableContent';
import { AppointmentsFilters } from './AppointmentsFilters';
import { AppointmentsEmptyState } from './AppointmentsEmptyState';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentDetails } from './AppointmentDetails';
import { AppointmentsPrintOptions } from './AppointmentsPrintOptions';
import { Appointment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppointmentsTableProps {
  onFiltersChange?: (filters: { statusId?: number; procedureId?: string }) => void;
}

export function AppointmentsTable({ onFiltersChange }: AppointmentsTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);
  const isMobile = useIsMobile();

  const {
    appointments,
    loading,
    refreshing,
    handleManualRefresh,
    handleFiltersChange,
    activeFilters
  } = useAppointmentsData();

  const hasActiveFilters = Boolean(activeFilters.statusId || activeFilters.procedureId);

  const handleFiltersChangeInternal = (newFilters: { statusId?: number; procedureId?: string }) => {
    handleFiltersChange(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    handleManualRefresh();
  };

  const handleDetailsClose = () => {
    setSelectedAppointment(null);
    handleManualRefresh();
  };

  const handleEditAppointment = (appointment: Appointment, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedAppointment(appointment);
  };

  const handlePrint = () => {
    setIsPrintOptionsOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AppointmentsFilters 
        onFiltersChange={handleFiltersChangeInternal}
      />

      <Card>
        <AppointmentsTableHeader
          appointmentsCount={appointments.length}
          hasActiveFilters={hasActiveFilters}
          onCreateAppointment={() => setIsFormOpen(true)}
          onRefresh={handleManualRefresh}
          onPrint={handlePrint}
          refreshing={refreshing}
        />
        
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <AppointmentsEmptyState 
              hasActiveFilters={hasActiveFilters}
              onCreateAppointment={() => setIsFormOpen(true)}
            />
          ) : (
            <>
              {isMobile ? (
                <div className="divide-y">
                  {appointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="p-4 space-y-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{appointment.patients?.full_name}</p>
                          <p className="text-xs text-gray-600">{appointment.procedures?.name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status_id === 1 ? 'bg-green-100 text-green-800' :
                          appointment.status_id === 2 ? 'bg-red-100 text-red-800' :
                          appointment.status_id === 3 ? 'bg-blue-100 text-blue-800' :
                          appointment.status_id === 4 ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.appointment_statuses?.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{appointment.professionals?.name}</span>
                        <span>
                          {new Date(appointment.startTime).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(appointment.startTime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <AppointmentsTableContent
                    appointments={appointments}
                    hasActiveFilters={hasActiveFilters}
                    onCreateAppointment={() => setIsFormOpen(true)}
                    onEditAppointment={handleEditAppointment}
                  />
                </ScrollArea>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AppointmentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        selectedDate={new Date()}
      />

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={handleDetailsClose}
          onUpdate={handleManualRefresh}
        />
      )}

      <AppointmentsPrintOptions
        isOpen={isPrintOptionsOpen}
        onClose={() => setIsPrintOptionsOpen(false)}
        appointments={appointments}
        activeFilters={activeFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}
