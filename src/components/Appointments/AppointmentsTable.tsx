
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

export function AppointmentsTable() {
  const {
    appointments,
    setAppointments,
    loading,
    refreshing,
    handleManualRefresh
  } = useAppointmentsData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<any>(null);

  const handleCreate = () => {
    console.log('=== OPENING CREATE FORM ===');
    setAppointmentToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (appointment: any, event: React.MouseEvent) => {
    console.log('=== OPENING EDIT FORM ===');
    console.log('Full appointment object:', appointment);
    
    // Prevent event bubbling
    event.preventDefault();
    event.stopPropagation();
    
    // Garantir que temos o objeto completo do appointment
    setAppointmentToEdit(appointment);
    setIsFormOpen(true);
  };

  const handleFormClose = (success?: boolean) => {
    console.log('=== FORM CLOSING ===', success ? 'with success' : '');
    setIsFormOpen(false);
    setAppointmentToEdit(null);
    
    // Recarregar dados sempre que o formulário fechar
    handleManualRefresh();
  };

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tabela de Agendamentos
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
                Nenhum agendamento encontrado
              </div>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Agendamento
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {appointment.patients?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {appointment.professionals?.name || 'N/A'}
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
                  ))}
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
