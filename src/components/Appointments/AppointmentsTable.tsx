
import { useState } from 'react';
import { useAppointmentsData } from '@/hooks/useAppointmentsData';
import { AppointmentsTableHeader } from './AppointmentsTableHeader';
import { AppointmentsTableContent } from './AppointmentsTableContent';
import { AppointmentsFilters } from './AppointmentsFilters';
import { AppointmentsEmptyState } from './AppointmentsEmptyState';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentDetails } from './AppointmentDetails';
import { Appointment } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppointmentsTableProps {
  onFiltersChange?: (filters: { statusId?: number; procedureId?: string }) => void;
}

export function AppointmentsTable({ onFiltersChange }: AppointmentsTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{ statusId?: number; procedureId?: string }>({});
  const isMobile = useIsMobile();

  const {
    appointments,
    loading,
    error,
    totalPages,
    totalCount,
    refreshAppointments
  } = useAppointmentsData({
    page: currentPage,
    limit: isMobile ? 10 : 20,
    statusId: filters.statusId,
    procedureId: filters.procedureId
  });

  const handleFiltersChange = (newFilters: { statusId?: number; procedureId?: string }) => {
    setFilters(newFilters);
    setCurrentPage(1);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Erro ao carregar agendamentos: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AppointmentsFilters 
        onFiltersChange={handleFiltersChange}
        onNewAppointment={() => setIsFormOpen(true)}
      />

      <Card>
        <AppointmentsTableHeader
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          loading={loading}
        />
        
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <AppointmentsEmptyState />
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
                          <p className="font-medium text-sm">{appointment.patient?.full_name}</p>
                          <p className="text-xs text-gray-600">{appointment.procedure?.name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status_id === 1 ? 'bg-green-100 text-green-800' :
                          appointment.status_id === 2 ? 'bg-red-100 text-red-800' :
                          appointment.status_id === 3 ? 'bg-blue-100 text-blue-800' :
                          appointment.status_id === 4 ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.appointment_status?.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{appointment.professional?.name}</span>
                        <span>
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
                    onAppointmentClick={setSelectedAppointment}
                    onUpdate={handleAppointmentUpdate}
                    loading={loading}
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
          onUpdate={handleAppointmentUpdate}
        />
      )}
    </div>
  );
}
