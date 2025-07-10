
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppointmentsData } from './hooks/useAppointmentsData';
import { useAppointmentEditor } from './hooks/useAppointmentEditor';
import { EditableCell } from './EditableCell';

export function AppointmentsTable() {
  const {
    appointments,
    setAppointments,
    loading,
    professionals,
    procedures,
    statuses,
    refreshing,
    handleManualRefresh
  } = useAppointmentsData();

  const {
    editingCell,
    setEditingCell,
    isUpdating,
    handleCellClick,
    handleCellSave,
    handleCellCancel,
    handleKeyDown,
    handleSelectChange
  } = useAppointmentEditor(appointments, setAppointments, professionals, procedures, statuses);

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tabela de Agendamentos
            {isUpdating && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Salvando...
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum agendamento encontrado
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.patients?.full_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        appointment={appointment}
                        field="professional_id"
                        displayValue={appointment.professionals?.name || 'N/A'}
                        actualValue={appointment.professional_id}
                        editingCell={editingCell}
                        setEditingCell={setEditingCell}
                        isUpdating={isUpdating}
                        onCellClick={handleCellClick}
                        onCellSave={handleCellSave}
                        onCellCancel={handleCellCancel}
                        onKeyDown={handleKeyDown}
                        onSelectChange={handleSelectChange}
                        professionals={professionals}
                        procedures={procedures}
                        statuses={statuses}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        appointment={appointment}
                        field="procedure_id"
                        displayValue={appointment.procedures?.name || 'Nenhum'}
                        actualValue={appointment.procedure_id || ''}
                        editingCell={editingCell}
                        setEditingCell={setEditingCell}
                        isUpdating={isUpdating}
                        onCellClick={handleCellClick}
                        onCellSave={handleCellSave}
                        onCellCancel={handleCellCancel}
                        onKeyDown={handleKeyDown}
                        onSelectChange={handleSelectChange}
                        professionals={professionals}
                        procedures={procedures}
                        statuses={statuses}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        appointment={appointment}
                        field="start_time"
                        displayValue={new Date(appointment.start_time).toLocaleString('pt-BR')}
                        actualValue={new Date(appointment.start_time).toISOString().slice(0, 16)}
                        editingCell={editingCell}
                        setEditingCell={setEditingCell}
                        isUpdating={isUpdating}
                        onCellClick={handleCellClick}
                        onCellSave={handleCellSave}
                        onCellCancel={handleCellCancel}
                        onKeyDown={handleKeyDown}
                        onSelectChange={handleSelectChange}
                        professionals={professionals}
                        procedures={procedures}
                        statuses={statuses}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        appointment={appointment}
                        field="status_id"
                        displayValue={appointment.appointment_statuses?.label || 'N/A'}
                        actualValue={appointment.status_id.toString()}
                        editingCell={editingCell}
                        setEditingCell={setEditingCell}
                        isUpdating={isUpdating}
                        onCellClick={handleCellClick}
                        onCellSave={handleCellSave}
                        onCellCancel={handleCellCancel}
                        onKeyDown={handleKeyDown}
                        onSelectChange={handleSelectChange}
                        professionals={professionals}
                        procedures={procedures}
                        statuses={statuses}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        appointment={appointment}
                        field="notes"
                        displayValue={appointment.notes || 'Sem observações'}
                        actualValue={appointment.notes || ''}
                        editingCell={editingCell}
                        setEditingCell={setEditingCell}
                        isUpdating={isUpdating}
                        onCellClick={handleCellClick}
                        onCellSave={handleCellSave}
                        onCellCancel={handleCellCancel}
                        onKeyDown={handleKeyDown}
                        onSelectChange={handleSelectChange}
                        professionals={professionals}
                        procedures={procedures}
                        statuses={statuses}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
