
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw, Plus, Pencil } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppointmentsData } from './hooks/useAppointmentsData';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentsFilters } from './AppointmentsFilters';

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

  // Função para verificar se o agendamento está em horário de folga
  const checkIfBreakTime = (appointment: any): boolean => {
    if (!appointment.professionals?.break_times) return false;
    
    const appointmentTime = new Date(appointment.start_time);
    const appointmentHour = appointmentTime.getHours();
    const appointmentMinute = appointmentTime.getMinutes();
    const appointmentTimeInMinutes = appointmentHour * 60 + appointmentMinute;
    
    return appointment.professionals.break_times.some((breakTime: any) => {
      const [startHour, startMinute] = breakTime.start.split(':').map(Number);
      const [endHour, endMinute] = breakTime.end.split(':').map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
      
      return appointmentTimeInMinutes >= startTimeInMinutes && appointmentTimeInMinutes < endTimeInMinutes;
    });
  };

  // Função para verificar se o agendamento está em período de férias
  const checkIfVacationTime = (appointment: any): boolean => {
    if (!appointment.professionals?.vacation_active || 
        !appointment.professionals?.vacation_start || 
        !appointment.professionals?.vacation_end) {
      return false;
    }
    
    const appointmentDate = new Date(appointment.start_time);
    const vacationStart = new Date(appointment.professionals.vacation_start);
    const vacationEnd = new Date(appointment.professionals.vacation_end);
    
    return appointmentDate >= vacationStart && appointmentDate <= vacationEnd;
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
      {/* Filtros */}
      <AppointmentsFilters onFiltersChange={handleFiltersChange} />

      <Card data-testid="appointments-table">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <div className="flex flex-col">
                <span>Tabela de Agendamentos</span>
                {hasActiveFilters && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {appointments.length} resultado{appointments.length !== 1 ? 's' : ''} encontrado{appointments.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                {hasActiveFilters 
                  ? 'Nenhum agendamento encontrado com os filtros selecionados'
                  : 'Nenhum agendamento encontrado'
                }
              </div>
              {!hasActiveFilters && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Agendamento
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  <span className="font-semibold">Legenda:</span> Agendamentos em horário de folga ou férias do profissional são destacados em vermelho claro
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => {
                    const isBreakTime = checkIfBreakTime(appointment);
                    const isVacationTime = checkIfVacationTime(appointment);
                    const shouldHighlight = isBreakTime || isVacationTime;
                    const highlightReason = isVacationTime ? 'Férias' : isBreakTime ? 'Folga' : '';
                    
                    return (
                      <TableRow 
                        key={appointment.id}
                        className={shouldHighlight ? 'bg-red-50 border-red-200' : ''}
                      >
                        <TableCell className="font-medium">
                          {appointment.patients?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div>
                            {appointment.professionals?.name || 'N/A'}
                            {shouldHighlight && (
                              <div className="text-xs text-red-600 font-semibold mt-1">
                                {highlightReason}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {appointment.procedures?.name || 'Nenhum'}
                        </TableCell>
                        <TableCell>
                          {new Date(appointment.start_time).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: appointment.appointment_statuses?.color + '20',
                              color: appointment.appointment_statuses?.color || '#6b7280'
                            }}
                          >
                            {appointment.appointment_statuses?.label || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {appointment.notes ? (
                              appointment.notes.length > 30 
                                ? appointment.notes.substring(0, 30) + '...'
                                : appointment.notes
                            ) : 'Sem observações'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(event) => handleEdit(appointment, event)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Criação/Edição */}
      <AppointmentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        selectedDate={new Date()}
        appointmentToEdit={appointmentToEdit}
      />
    </>
  );
}
