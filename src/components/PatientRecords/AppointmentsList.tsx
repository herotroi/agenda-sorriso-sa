import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, User, Clock, FileText, X } from 'lucide-react';
import type { Appointment } from '@/types/prontuario';

interface AppointmentsListProps {
  appointments: Appointment[];
  selectedAppointment: string | null;
  onAppointmentSelect: (appointmentId: string) => void;
  loading: boolean;
  onClearSelection: () => void;
}

export function AppointmentsList({ 
  appointments, 
  selectedAppointment, 
  onAppointmentSelect, 
  loading,
  onClearSelection
}: AppointmentsListProps) {
  if (loading) {
    return (
      <Card className="h-[600px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            Procedimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando agendamentos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            <span className="truncate">Procedimentos ({appointments.length})</span>
          </CardTitle>
          {selectedAppointment && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Seleção
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedAppointment 
            ? 'Procedimento selecionado - documentos filtrados'
            : 'Clique em um procedimento para ver seus documentos'
          }
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 px-6">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum procedimento encontrado</p>
          </div>
        ) : (
          <ScrollArea className="h-[480px]">
            <div className="space-y-2 p-6 pt-0">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedAppointment === appointment.id
                      ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20'
                      : 'hover:bg-muted/50 hover:border-muted-foreground/30'
                  }`}
                  onClick={() => onAppointmentSelect(appointment.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex items-center text-sm min-w-0 flex-1">
                      <Calendar className={`h-4 w-4 mr-2 flex-shrink-0 ${
                        selectedAppointment === appointment.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className="font-medium truncate">
                        {new Date(appointment.start_time).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {appointment.procedures?.name && (
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full truncate max-w-full ${
                        selectedAppointment === appointment.id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.procedures.name}
                      </span>
                    </div>
                  )}

                  {appointment.professionals?.name && (
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <User className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">Dr(a). {appointment.professionals.name}</span>
                    </div>
                  )}

                  {appointment.price && (
                    <div className="text-sm font-medium text-green-600 mb-2">
                      R$ {appointment.price.toFixed(2).replace('.', ',')}
                    </div>
                  )}

                  {appointment.notes && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 break-words">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
