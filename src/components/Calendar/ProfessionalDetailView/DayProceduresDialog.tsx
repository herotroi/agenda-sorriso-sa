import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, FileText, Edit } from 'lucide-react';
import { Appointment } from '@/components/Appointments/types';
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';

interface DayProceduresDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  appointments: Appointment[];
  professionalName: string;
  professionalColor: string;
}

export function DayProceduresDialog({ 
  isOpen, 
  onClose, 
  date, 
  appointments, 
  professionalName,
  professionalColor 
}: DayProceduresDialogProps) {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  const sortedAppointments = appointments.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const handleEditAppointment = (appointment: Appointment) => {
    console.log('Editar agendamento:', appointment.id);
    setAppointmentToEdit(appointment);
    setIsEditFormOpen(true);
  };

  const handleEditFormClose = () => {
    setIsEditFormOpen(false);
    setAppointmentToEdit(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: professionalColor }}
              />
              Procedimentos de {professionalName}
            </DialogTitle>
            <div className="text-sm text-gray-600">
              {date.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {sortedAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum procedimento agendado para este dia
              </div>
            ) : (
              sortedAppointments.map((appointment) => {
                const startTime = new Date(appointment.start_time);
                const endTime = new Date(appointment.end_time);
                const statusColor = appointment.appointment_statuses?.color || '#6b7280';

                return (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {startTime.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {endTime.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAppointment(appointment)}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          title="Editar procedimento"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Badge 
                          className="text-white font-semibold"
                          style={{ backgroundColor: statusColor }}
                        >
                          {appointment.appointment_statuses?.label || appointment.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-800">
                          {appointment.patients?.full_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {appointment.procedures?.name || 'Procedimento não especificado'}
                        </span>
                      </div>

                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            Observações:
                          </div>
                          <div className="text-sm text-gray-600">
                            {appointment.notes}
                          </div>
                        </div>
                      )}

                      {appointment.price && (
                        <div className="mt-2 text-sm font-medium text-green-600">
                          Valor: R$ {Number(appointment.price).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {appointmentToEdit && (
        <AppointmentForm
          isOpen={isEditFormOpen}
          onClose={handleEditFormClose}
          selectedDate={new Date(appointmentToEdit.start_time)}
          appointmentToEdit={appointmentToEdit}
        />
      )}
    </>
  );
}
