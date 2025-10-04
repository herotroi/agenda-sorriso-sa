
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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
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
                      className="p-4 space-y-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base text-gray-900 truncate">{appointment.patients?.full_name}</p>
                          <p className="text-sm text-gray-600 mt-1 truncate">{appointment.procedures?.name}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                          appointment.status_id === 1 ? 'bg-green-100 text-green-800' :
                          appointment.status_id === 2 ? 'bg-red-100 text-red-800' :
                          appointment.status_id === 3 ? 'bg-blue-100 text-blue-800' :
                          appointment.status_id === 4 ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.appointment_statuses?.label}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600">
                        <span className="truncate">{appointment.professionals?.name}</span>
                        <span className="text-sm font-medium whitespace-nowrap">
                          {new Date(appointment.start_time).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
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
