
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Clock, FileText } from 'lucide-react';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  price?: number;
  procedures: { name: string } | null;
  professionals: { name: string } | null;
}

interface AppointmentsListProps {
  appointments: Appointment[];
  selectedAppointment: string | null;
  onAppointmentSelect: (appointmentId: string) => void;
  loading: boolean;
}

export function AppointmentsList({ 
  appointments, 
  selectedAppointment, 
  onAppointmentSelect, 
  loading 
}: AppointmentsListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Procedimentos ({appointments.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Clique em um procedimento para ver seus documentos
        </p>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum procedimento encontrado</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center text-sm">
                    <Calendar className={`h-4 w-4 mr-2 ${
                      selectedAppointment === appointment.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <span className="font-medium">
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
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
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
                    <User className="h-4 w-4 mr-1" />
                    Dr(a). {appointment.professionals.name}
                  </div>
                )}

                {appointment.price && (
                  <div className="text-sm font-medium text-green-600 mb-2">
                    R$ {appointment.price.toFixed(2).replace('.', ',')}
                  </div>
                )}

                {appointment.notes && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {appointment.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
